import { File } from "../models/file.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary, generateSignedUrl } from "../utils/cloudinary.js";
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

        console.log('[downloadViaToken] Starting download for file:', file.filename, 'URL:', file.url);

        let fileResponse;
        try {
            // First try the direct URL (works for public files)
            console.log('[downloadViaToken] Attempting direct URL download...');
            fileResponse = await axios.get(file.url, {
                responseType: 'stream',
                timeout: 120000,
                maxRedirects: 5,
                validateStatus: (status) => status < 500
            });

            console.log('[downloadViaToken] Direct URL response status:', fileResponse.status);

            // If 401, try with signed URL
            if (fileResponse.status === 401) {
                console.log('[downloadViaToken] Got 401, generating signed URL for private file');
                console.log('[downloadViaToken] Original URL:', file.url);
                
                // Extract resource_type and public_id from Cloudinary URL
                // Format: https://res.cloudinary.com/{cloud}/{resource_type}/upload/v{version}/{public_id}
                const urlParts = file.url.split('/upload/');
                if (urlParts.length < 2) {
                    throw new Error('Invalid Cloudinary URL format');
                }
                
                // Extract resource type (image, video, raw, etc.)
                const beforeUpload = urlParts[0];
                console.log('[downloadViaToken] URL before upload:', beforeUpload);
                const resourceTypeMatch = beforeUpload.match(/\/(image|video|raw)\//);
                const resourceType = resourceTypeMatch ? resourceTypeMatch[1] : 'image';
                
                // Get the public_id (everything after /upload/ without version number)
                let publicId = urlParts[1].split('/').slice(1).join('/');
                // Remove file extension for resource_type detection
                publicId = publicId.replace(/\.[^/.]+$/, '');
                
                console.log('[downloadViaToken] Detected resource type:', resourceType, 'Public ID:', publicId);
                
                // Generate signed URL using imported function
                const signedUrl = generateSignedUrl(publicId, resourceType);
                
                if (!signedUrl) {
                    throw new Error('Failed to generate signed URL - check Cloudinary credentials');
                }
                
                console.log('[downloadViaToken] Trying signed URL:', signedUrl);
                fileResponse = await axios.get(signedUrl, {
                    responseType: 'stream',
                    timeout: 120000,
                    maxRedirects: 5,
                    validateStatus: (status) => status < 500
                });
                
                console.log('[downloadViaToken] Signed URL response status:', fileResponse.status);
            }

            console.log('[downloadViaToken] Final response status:', fileResponse.status, 'content-length:', fileResponse.headers['content-length']);
        } catch (axiosError) {
            console.error('[downloadViaToken] Cloudinary access error:', axiosError.message);
            console.error('[downloadViaToken] Error response status:', axiosError.response?.status);
            console.error('[downloadViaToken] Error response statusText:', axiosError.response?.statusText);
            console.error('[downloadViaToken] Original URL:', file.url);
            throw new apiError(500, `Unable to download file: ${axiosError.message}. HTTP Status: ${axiosError.response?.status || 'N/A'}`);
        }

        // Force download by using application/octet-stream for all file types
        // This prevents browser from trying to display PDFs, images, videos inline
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        if (fileResponse.headers['content-length']) {
            res.setHeader('Content-Length', fileResponse.headers['content-length']);
        }
        
        // Pipe the file stream to response with error handling
        fileResponse.data.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Error streaming file' });
            }
        });
        
        fileResponse.data.pipe(res).on('finish', () => {
            console.log('File download completed:', file.filename);
        });
    } catch (error) {
        console.error('Download error:', error.message);
        console.error('Error details:', error);
        
        if (!res.headersSent) {
            if(error.name === 'JsonWebTokenError') {
                throw new apiError(400, "Invalid download token");
            }
            if(error.name === 'TokenExpiredError') {
                throw new apiError(400, "Download link has expired");
            }
            throw new apiError(500, "Error downloading file: " + error.message);
        }
    }

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

        console.log('[downloadFileById] Starting download for file:', file.filename, 'URL:', file.url);

        // Increment download count
        file.downloadCount += 1;
        await file.save();

        let fileResponse;
        try {
            // First try the direct URL (works for public files)
            console.log('[downloadFileById] Attempting direct URL download...');
            fileResponse = await axios.get(file.url, {
                responseType: 'stream',
                timeout: 120000,
                maxRedirects: 5,
                validateStatus: (status) => status < 500
            });

            console.log('[downloadFileById] Direct URL response status:', fileResponse.status);

            // If 401, try with signed URL
            if (fileResponse.status === 401) {
                console.log('[downloadFileById] Got 401, generating signed URL for private file');
                console.log('[downloadFileById] Original URL:', file.url);
                
                // Extract resource_type and public_id from Cloudinary URL
                // Format: https://res.cloudinary.com/{cloud}/{resource_type}/upload/v{version}/{public_id}
                const urlParts = file.url.split('/upload/');
                if (urlParts.length < 2) {
                    throw new Error('Invalid Cloudinary URL format');
                }
                
                // Extract resource type (image, video, raw, etc.)
                const beforeUpload = urlParts[0];
                console.log('[downloadFileById] URL before upload:', beforeUpload);
                const resourceTypeMatch = beforeUpload.match(/\/(image|video|raw)\//);
                const resourceType = resourceTypeMatch ? resourceTypeMatch[1] : 'image';
                
                // Get the public_id (everything after /upload/ without version number)
                let publicId = urlParts[1].split('/').slice(1).join('/');
                // Remove file extension for resource_type detection
                publicId = publicId.replace(/\.[^/.]+$/, '');
                
                console.log('[downloadFileById] Detected resource type:', resourceType, 'Public ID:', publicId);
                
                // Generate signed URL using imported function
                const signedUrl = generateSignedUrl(publicId, resourceType);
                
                if (!signedUrl) {
                    throw new Error('Failed to generate signed URL - check Cloudinary credentials');
                }
                
                console.log('[downloadFileById] Trying signed URL:', signedUrl);
                fileResponse = await axios.get(signedUrl, {
                    responseType: 'stream',
                    timeout: 120000,
                    maxRedirects: 5,
                    validateStatus: (status) => status < 500
                });
                
                console.log('[downloadFileById] Signed URL response status:', fileResponse.status);
            }

            console.log('[downloadFileById] Final response status:', fileResponse.status, 'content-length:', fileResponse.headers['content-length']);
        } catch (axiosError) {
            console.error('[downloadFileById] Cloudinary access error:', axiosError.message);
            console.error('[downloadFileById] Error response status:', axiosError.response?.status);
            console.error('[downloadFileById] Error response statusText:', axiosError.response?.statusText);
            console.error('[downloadFileById] Original URL:', file.url);
            throw new apiError(500, `Unable to download file: ${axiosError.message}. HTTP Status: ${axiosError.response?.status || 'N/A'}`);
        }

        // Force download by using application/octet-stream for all file types
        // This prevents browser from trying to display PDFs, images, videos inline
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        if (fileResponse.headers['content-length']) {
            res.setHeader('Content-Length', fileResponse.headers['content-length']);
        }
        
        // Pipe the file stream to response with error handling
        fileResponse.data.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Error streaming file' });
            }
        });
        
        fileResponse.data.pipe(res).on('finish', () => {
            console.log('File download completed:', file.filename);
        });
    } catch (error) {
        console.error('Download error:', error.message);
        console.error('Error details:', error);
        
        if (!res.headersSent) {
            throw error; // Let asyncHandler handle it
        }
    }
})

export {fileUpload,getFileById,getAllFiles,deleteFile,generateShareLink,downloadViaToken,downloadFileById}