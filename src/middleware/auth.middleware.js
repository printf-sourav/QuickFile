import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"


export const verifyJWT= asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer","");
    
        if(!token){
            throw new apiError(401,"Unauthorized request")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new apiError(404,"Invalid accessToken");
        }
        req.user=user;
        next();
    } catch (err) {
        throw new apiError(401, err?.message||"Inavlid access Token")
    }

})