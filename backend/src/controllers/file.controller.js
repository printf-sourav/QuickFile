import { File } from "../models/file.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import mongoose  from "mongoose";
import { response } from "express";
import axios from "axios"

const fileUpload = asyncHandler(async (req,res,next)=>{
    const files = req.files;
    console.log('Upload request - User:', req.user?._id);
    console.log('Files received:', files?.length);
    
    if(!files || files.length == 0){
        throw new apiError(400,"Files are missing");
    }
    
    if(!req.user || !req.user._id){
        throw new apiError(401,"User not authenticated");
    }

    const uploadedFiles = [];
    for(const file of files){
        console.log('Uploading file:', file.originalname);
        const result = await uploadOnCloudinary(file.path)
        if(!result){
            throw new apiError(500,"Something went wrong while uploading file")
        }

        const newFile = await File.create({
            filename: file.originalname,
            url: result.url,
            size: file.size,
            owner: req.user._id,
            downloadCount: 0
        })
        console.log('File saved to DB:', newFile._id);
        uploadedFiles.push(newFile);
    }

    return res.status(200)
    .json(
        new apiResponse(200, uploadedFiles, "Files uploaded successfully")
    )
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
    const querySearch = Search? {filename:{$regex:Search,Option:"i"}} : {}

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
    if(!files||files.length==0){
        throw new apiError(404,"Files not found");
    }
    return res.status(200)
    .json(
        new apiResponse(200,files,"Files fetched")
    )
})
const deleteFile = asyncHandler(async(req,res,next)=>{
    const {FileId} = req.params;
    console.log('Delete request for FileId:', FileId);
    console.log('User:', req.user?._id);
    
    if(!FileId) {
        throw new apiError(400,"Please mention file id");
    }
    
    // Verify the file belongs to the user
    const file = await File.findOne({ _id: FileId, owner: req.user._id });
    if(!file){
        throw new apiError(404,"File not found or you don't have permission to delete it");
    }
    
    // Delete the file
    await File.findByIdAndDelete(FileId);
    
    console.log('File deleted successfully:', FileId);
    
    return res.status(200)
    .json(
        new apiResponse(200, { _id: FileId, filename: file.filename }, "File deleted successfully")
    )
})


const generateShareLink = asyncHandler(async(req,res)=>{
    const fileId = req.params.id

   if (!mongoose.isValidObjectId(fileId)) {
        throw new apiError(400, "Invalid file id");
    }
    const file = await File.findById(fileId);
    if(!file){
        throw new apiError(404,"File not found!!");
    }
    const token = jwt.sign(
        {_id:file._id},
        process.env.SHARE_LINK_TOKEN,
        {expiresIn:process.env.SHARE_LINK_TOKEN_EXPIRY}
    )

    if(!token){
        throw new apiError(500,"Error while creating token");
    }

    // Generate frontend URL instead of backend API URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const longUrl = `${frontendUrl}/download/${token}`;

    try {
        const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = data;

        return res.status(200)
        .json(
            new apiResponse(
                200,
                {shortUrl,longUrl, token},
                "Link successfully created"
            )
        )
    } catch (error) {
        // If TinyURL fails, just return the long URL
        return res.status(200)
        .json(
            new apiResponse(
                200,
                {shortUrl: longUrl, longUrl, token},
                "Link successfully created"
            )
        )
    }

})

const downloadViaToken = asyncHandler(async(req,res)=>{
    const token = req.params.token

    const decoded = jwt.verify(token,process.env.SHARE_LINK_TOKEN);

    if(!decoded){
        throw new apiError(404,"invalid token or its expired")
    }

    const fileId= decoded._id

    const file = await File.findByIdAndUpdate(fileId,{
        $inc:{downloadCount:1}
    });

    if(!file){
        throw new apiError(404,"File not found");
    }

    // Fetch the file from Cloudinary and stream it to the client
    try {
        const fileResponse = await axios.get(file.url, {
            responseType: 'stream'
        });

        // Get content type from cloudinary response or determine from filename
        let contentType = fileResponse.headers['content-type'];
        
        // If content type not available, try to determine from file extension
        if (!contentType || contentType === 'application/octet-stream') {
            const ext = file.filename.split('.').pop().toLowerCase();
            const mimeTypes = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'txt': 'text/plain',
                'zip': 'application/zip',
                'mp4': 'video/mp4',
                'mp3': 'audio/mpeg'
            };
            contentType = mimeTypes[ext] || 'application/octet-stream';
        }

        // Set headers to force download with proper filename
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`);
        
        // Set content length if available
        if (fileResponse.headers['content-length']) {
            res.setHeader('Content-Length', fileResponse.headers['content-length']);
        }
        
        // Pipe the file stream to response
        fileResponse.data.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        throw new apiError(500, "Error downloading file from storage");
    }

})

export {fileUpload,getFileById,getAllFiles,deleteFile,generateShareLink,downloadViaToken}