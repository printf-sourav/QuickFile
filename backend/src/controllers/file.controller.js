import { File } from "../models/file.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { uploadToSupabase, getSupabaseFileURL, createSupabaseSignedUrl, supabase } from "../utils/superbase.js";
import fs from 'fs'
import mongoose  from "mongoose";
 


const fileUpload = asyncHandler(async (req,res,next)=>{
    const file = req.file;
    if(!file){
        throw new apiError(400,"File is missing (expected field 'file')");
    }
    const bucket = process.env.SUPABASE_BUCKET || 'quickfile';
    if (!process.env.SUPABASE_URL) {
        throw new apiError(500, 'Storage misconfigured: SUPABASE_URL missing');
    }
    if (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new apiError(500, 'Storage misconfigured: SUPABASE key missing');
    }
    const destPath = `${req.user?._id || 'anonymous'}/${Date.now()}-${file.originalname}`;
    try {
        const LIMIT_BYTES = 100 * 1024 * 1024;
        const userId = req.user?._id;
        if (userId) {
            const agg = await File.aggregate([
                { $match: { owner: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: null, total: { $sum: "$size" } } }
            ]);
            const used = agg[0]?.total || 0;
            if (used + file.size > LIMIT_BYTES) {
                try { fs.unlinkSync(file.path); } catch {}
                const usedMb = (used / (1024*1024)).toFixed(2);
                throw new apiError(403, `Storage limit exceeded. You have used ${usedMb} MB of 100 MB. Delete some files to upload more.`);
            }
        }
    await uploadToSupabase(bucket, file.path, destPath);
    const publicUrl = getSupabaseFileURL(bucket, destPath);

    let expiryHours = parseInt(req.body?.expiryHours, 10);
    if (Number.isNaN(expiryHours) || expiryHours <= 0) expiryHours = 24; 
    const MAX_HOURS = 30 * 24;
    if (expiryHours > MAX_HOURS) expiryHours = MAX_HOURS;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
        const newFile = await File.create({
            filename: file.originalname,
            url: publicUrl,
            size: file.size,
            owner: req.user?._id,
            provider: 'supabase',
            bucket,
            storagePath: destPath,
            expiresAt
        })
        return res.status(200).json(new apiResponse(200, newFile, "File uploaded successfully"))
    } catch (supErr) {
        console.error('[fileUpload] Supabase upload failed:', {
            message: supErr?.message,
            code: supErr?.code,
            name: supErr?.name,
            status: supErr?.status,
            details: supErr?.errorDetails || supErr
        });
        throw new apiError(500, `Upload failed: ${supErr?.message || 'unknown error'}`,[{
            code: supErr?.code,
            name: supErr?.name,
            status: supErr?.status,
        }]);
    }
})

const getFileById = asyncHandler(async(req,res,next)=>{
    const {FileId} = req.params
    if(!FileId){
        throw new apiError(400,"Please mention video id in url")
    }
    const file = await File.findByIdAndUpdate(FileId,{
        $inc:{downloadCount:1}
    });
    if(!file){
        throw new apiError(404,"File not found")
    }
    return res.status(200)
    .json(
        new apiResponse(200,file,"File fetched")
    )

})
const getAllFiles = asyncHandler(async(req,res,next)=>{

    const page = parseInt(req.query.page)||1;
    const limit = parseInt(req.query.limit)||10;
    const skip = (page-1)*limit

    const Search = req.query.search||""
    const querySearch = Search? { filename: { $regex: Search, $options: "i" } } : {}

    const filters={};
    if(req.query.type) filters.type = req.query.type;



    const query = {
        owner:req.user?._id,
        ...querySearch,
        ...filters

    }

    const files = await File.find(query)
    .skip(skip)
    .limit(limit)
    .sort({createdAt:-1})
    .populate("owner","_id username")
    return res.status(200).json(new apiResponse(200, files, "Files fetched"))
})
const deleteFile = asyncHandler(async(req,res,next)=>{
    const {FileId} = req.params;
    
    if(!FileId) {
        throw new apiError(400,"Please mention file id");
    }
    
    const file = await File.findOne({ _id: FileId, owner: req.user._id });
    if(!file){
        throw new apiError(404,"File not found or you don't have permission to delete it");
    }
    
    await File.findByIdAndDelete(FileId);
    
    return res.status(200)
    .json(
        new apiResponse(200, { _id: FileId, filename: file.filename }, "File deleted successfully")
    )
})


const downloadFileById = asyncHandler(async(req,res)=>{
    const {FileId} = req.params;

    try {
        if(!FileId){
            throw new apiError(400, "File ID is required");
        }

        const file = await File.findOne({ _id: FileId, owner: req.user._id });

        if(!file){
            throw new apiError(404, "File not found or you don't have permission");
        }


        file.downloadCount += 1;
        await file.save();

        let fileUrl = file.url;
        if (file.provider === 'supabase') {
            try {
                const bucket = file.bucket || (process.env.SUPABASE_BUCKET || 'quickfile');
                const path = file.storagePath;
                if (!path) throw new Error('storagePath missing');
                const { data, error } = await supabase.storage.from(bucket).download(path);
                if (error) throw error;
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
                if (typeof data.stream === 'function') {
                    const { Readable } = await import('stream');
                    return Readable.fromWeb(data.stream()).pipe(res);
                }
                const buf = Buffer.from(await data.arrayBuffer());
                res.setHeader('Content-Length', buf.length);
                return res.status(200).send(buf);
            } catch (e) {
                try {
                    const bucket = file.bucket || (process.env.SUPABASE_BUCKET || 'quickfile');
                    const path = file.storagePath || '';
                    const signed = await createSupabaseSignedUrl(bucket, path, 600);
                    if (signed) return res.redirect(302, signed);
                } catch {}
            }
        }
        return res.redirect(302, fileUrl);
    } catch (error) {
        if (!res.headersSent) {
            throw error;
        }
    }
})
export {fileUpload,getFileById,getAllFiles,deleteFile,downloadFileById}