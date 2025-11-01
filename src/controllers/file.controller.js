import { File } from "../models/file.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import mongoose  from "mongoose";
import { response } from "express";

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
        throw new apiError(400,"PLease mention video id");
    }
    const file = await File.findByIdAndDelete(FileId);
    if(!file){
        throw new apiError(404,"File not found or deleted");
    }
    return res.status(200)
    .json(
        new apiResponse(200,file,"File deleted")
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

    const shortUrl = `${req.protocol}://${req.get("host")}/api/v1/files/download/${token}`;

    return res.status(200)
    .json(
        new apiResponse(
            200,
            shortUrl,
            "LInk successfully created"
        )
    )

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
        throw new apiError("File not found");
    }

    return res.status(200)
    .json(
        new apiResponse(
            200,file.url,"File fetched"
        )
    )

})

export {fileUpload,getFileById,getAllFiles,deleteFile,generateShareLink,downloadViaToken}