import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

import { v2 } from 'cloudinary';


 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


const  uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null;

        const response= await v2.uploader.upload(localFilePath,{
            folder: "quickFile",
            resource_type : "auto"
        })
        console.log(response)
        fs.unlinkSync(localFilePath)
         return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)  //remove the locally saved temp file as the upload operation got failed
        return null
    }
}
export {uploadOnCloudinary}