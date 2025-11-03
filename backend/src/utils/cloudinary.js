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
            type: "upload", // Public upload type
            access_mode: "public" // Make file publicly accessible
        })
        
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

// Generate a signed URL for secure download (if needed)
const generateSignedUrl = (publicId, resourceType = "raw") => {
    try {
        // Generate signed URL with authentication
        // For private files, we need to use the full public_id with version
        const url = cloudinary.url(publicId, {
            resource_type: resourceType,
            type: "upload",
            sign_url: true,
            secure: true,
            // Add authentication parameters
            api_key: process.env.CLOUDINARY_API_KEY,
        });
        
        console.log('[generateSignedUrl] Generated URL for publicId:', publicId, 'resourceType:', resourceType);
        console.log('[generateSignedUrl] URL:', url);
        
        return url;
    } catch (error) {
        console.error('[generateSignedUrl] Error generating signed URL:', error);
        return null;
    }
}

export { uploadOnCloudinary, generateSignedUrl }