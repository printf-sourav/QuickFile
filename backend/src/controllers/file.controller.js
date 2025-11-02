import { File } from "../models/file.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import mongoose  from "mongoose";
import axios from "axios"


const fileUpload = asyncHandler(async (req,res,next)=>{
    const files = req.files;
    if(!files || files.length == 0){
        throw new apiError(400,"Files are missing");
    }
    

    const uploadedFiles = [];
    for(const file of files){
        const result = await uploadOnCloudinary(file.path)
        if(!result){
            throw new apiError(500,"SOmething went wrong while uploading file")
        }

        const newFile = await File.create({
            filename:file.originalname,
            url:result.url,
            size:file.size,
            owner: req.user?._id
        })
        uploadedFiles.push(newFile);
    }

    return res.status(200)
    .json(
        new apiResponse(200,uploadedFiles,"Files uploaded successfully")
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

    try {
        const decoded = jwt.verify(token, process.env.SHARE_LINK_TOKEN);

        if(!decoded){
            throw new apiError(404, "Invalid token or it's expired")
        }

        const fileId = decoded._id

        const file = await File.findByIdAndUpdate(fileId, {
            $inc: {downloadCount: 1}
        }, {new: true});

        if(!file){
            throw new apiError(404, "File not found");
        }

        // Stream file from Cloudinary with proper download headers
        const fileResponse = await axios.get(file.url, {
            responseType: 'stream'
        });

        // Force download by using application/octet-stream for all file types
        // This prevents browser from trying to display PDFs, images, videos inline
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Use both filename and filename* for better browser compatibility
        const encodedFilename = encodeURIComponent(file.filename);
        const asciiFilename = file.filename.replace(/[^\x00-\x7F]/g, '_'); // Replace non-ASCII with underscore
        res.setHeader('Content-Disposition', `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`);
        res.setHeader('Cache-Control', 'no-cache');
        
        if (fileResponse.headers['content-length']) {
            res.setHeader('Content-Length', fileResponse.headers['content-length']);
        }
        
        // Pipe the file stream to response
        fileResponse.data.pipe(res);
    } catch (error) {
        if(error.name === 'JsonWebTokenError') {
            throw new apiError(400, "Invalid download token");
        }
        if(error.name === 'TokenExpiredError') {
            throw new apiError(400, "Download link has expired");
        }
        throw new apiError(500, "Error downloading file");
    }

})

const downloadFileById = asyncHandler(async(req,res)=>{
    const {FileId} = req.params;

    if(!FileId){
        throw new apiError(400, "File ID is required");
    }

    const file = await File.findOne({ _id: FileId, owner: req.user._id });

    if(!file){
        throw new apiError(404, "File not found or you don't have permission");
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    // Stream file from Cloudinary with proper download headers
    const fileResponse = await axios.get(file.url, {
        responseType: 'stream'
    });

    // Force download by using application/octet-stream for all file types
    // This prevents browser from trying to display PDFs, images, videos inline
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Use both filename and filename* for better browser compatibility
    const encodedFilename = encodeURIComponent(file.filename);
    const asciiFilename = file.filename.replace(/[^\x00-\x7F]/g, '_'); // Replace non-ASCII with underscore
    res.setHeader('Content-Disposition', `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Cache-Control', 'no-cache');
    
    if (fileResponse.headers['content-length']) {
        res.setHeader('Content-Length', fileResponse.headers['content-length']);
    }
    
    // Pipe the file stream to response
    fileResponse.data.pipe(res);
})

export {fileUpload,getFileById,getAllFiles,deleteFile,generateShareLink,downloadViaToken,downloadFileById}