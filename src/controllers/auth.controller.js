import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js" 
import jwt from "jsonwebtoken"

const generateNewAccessAndRefreshToken = async(userId)=>{
    const user = await User.findById(userId);
    if(!user){
        throw new apiError(404,"User doesnt exist");
    }
    const refreshToken = await user.generateNewRefreshToken();
    const accessToken = await user.generateNewAccessToken();

    user.refreshToken=refreshToken;

    await user.save({validateBeforeSave:false});

    return {accessToken,refreshToken};
}

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
    user.save({validateBeforeSave:false})
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

const loginUser = asyncHandler(async(req,res)=>{
    const {username,password} = req.body;

    if(!username||!password){
        throw new apiError(400,"username and password required");
    }
    const user = await User.findOne({username:username});

    if(!user){
        throw new apiError(404,"User doesnt exist");
    }
    const isPasswordVaild = await user.isPasswordCorrect(password)
    if(!isPasswordVaild){
        throw new apiError(401,"Password is invalid");
    }
    const {accessToken,refreshToken} = await generateNewAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const option = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new apiResponse(200,loggedInUser,"User Logged IN")
    );
})

const logoutUser = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(userId,
        {
            $unset:{
                refreshtoken:1
            }
        },
        {
            new:true
        }
    )
    const option={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new apiResponse(200,null,"Logout Success")
    )

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    try{
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new apiError(401, "Unauthorized access")
        }

        const decoded = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findOne({_id:decoded._id});
        if(!user){
            throw new apiError(200,"User has no stored refresh token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh Token expire")
        }

        const options = {
            httpOnly: true,
            secure:true
        }

        const {accessToken,refreshToken}= await generateNewAccessAndRefreshToken(user._id);
        user.save({validateBeforeSave:false});
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken: accessToken, refreshToken: refreshToken },
                    "access token refreshed"
                )
            )
    }
    catch(err){
        throw new apiError(401,err?.message||"Invalid access Token")
    }
})

export {registerUser,loginUser,logoutUser,refreshAccessToken}