import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js" 

const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,password} = req.body;

    if(!username || !email || !password){
        throw new apiError(400,"All details are required");
    }

    const UserExist = await User.findOne({
        $or : [{email},{username}]
    })
    if(UserExist){
        throw new apiError(409,"User exisists")
    }

    const avatarLocalPath = req.file?.path 

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const user = await User.create({
        avatar: avatar?.url,
        email,
        password,
        username: username.toLowerCase()

    })

    const UserCheck = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!UserCheck) {
        throw new apiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new apiResponse(200, UserCheck, "User register successfully")
    )
})

export {registerUser}