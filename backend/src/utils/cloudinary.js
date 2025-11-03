import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath, folder="quickfile/uploads") => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: "auto",
            type: "upload",
            access_mode: "public",
            // Add flags to ensure public accessibility
            invalidate: true
        })
        
        console.log('[uploadOnCloudinary] Upload response:', {
            url: response.url,
            secure_url: response.secure_url,
            access_mode: response.access_mode,
            type: response.type,
            resource_type: response.resource_type
        });
        
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.error('[uploadOnCloudinary] Upload error:', error);
        fs.unlinkSync(localFilePath)
        return null
    }
}

// Generate a properly authenticated URL for download
const generateAuthenticatedUrl = (publicId, resourceType = "image") => {
    try {
        // Generate signed URL with proper authentication for Cloudinary
        const timestamp = Math.round(Date.now() / 1000);
        
        const url = cloudinary.url(publicId, {
            resource_type: resourceType,
            type: "upload",
            sign_url: true,
            secure: true,
            timestamp: timestamp,
            // Force download with attachment flag
            flags: "attachment"
        });
        
        console.log('[generateAuthenticatedUrl] Generated URL for publicId:', publicId, 'resourceType:', resourceType);
        console.log('[generateAuthenticatedUrl] URL:', url);
        
        return url;
    } catch (error) {
        console.error('[generateAuthenticatedUrl] Error generating authenticated URL:', error);
        return null;
    }
}

// Backward compatibility
const generateSignedUrl = generateAuthenticatedUrl;

export { uploadOnCloudinary, generateSignedUrl }