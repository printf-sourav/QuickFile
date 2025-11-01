import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { File } from "../models/file.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import mongoose  from "mongoose";

const getUserStats = asyncHandler(async(req,res)=>{
    const userId= req.user._id;

    const totalFiles = await File.countDocuments({owner:userId});

    const totalDownloadsData = await File.aggregate([
        {$match:{owner:userId}},
        {$group:{_id:null,totalDownloads:{$sum:"$downloadCount"}}}
    ])

    const totalDownloads = totalDownloadsData[0]?.totalDownloads ||0;
    
    const totalStorageData = await File.aggregate([
        {$match:{owner:userId}},
        {$group:{_id:null,totalSize:{$sum:"$size"}}}
    ])

    const totalStorageUsed = (totalStorageData[0]?.totalSize||0)/(1024*1024)

    const mostDownloadedFIle =  await File.findOne({owner:userId})
    .sort({downloadCount:-1})
    .limit(1)
    .select("filename downloadCount url")

    const stats = {
        totalFiles:totalFiles,
        totalDownloads:totalDownloads,
        totalStorageUsed:`${totalStorageUsed.toFixed(2)} MB`,
        mostDownloadedFile:mostDownloadedFIle||0
    }

    return res.status(200)
    .json(
        new apiResponse(
            200,stats,"Stats fetched Successfully"
        )
    )

})

export {getUserStats}
