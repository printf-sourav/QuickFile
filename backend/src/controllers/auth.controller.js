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
        throw new apiError(400,"All fields are required (username, email, password)");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        throw new apiError(400,"Please provide a valid email address");
    }

    // Password validation (minimum 6 characters)
    if(password.length < 6){
        throw new apiError(400,"Password must be at least 6 characters long");
    }

    // Check if username already exists
    const existingUsername = await User.findOne({username: username.toLowerCase()});
    if(existingUsername){
        throw new apiError(409,"Username already taken. Please choose another username");
    }

    // Check if email already exists
    const existingEmail = await User.findOne({email});
    if(existingEmail){
        throw new apiError(409,"Email already registered. Please login or use another email");
    }

    const avatarLocalPath = req.file?.path 

    const avatar = await uploadOnCloudinary(avatarLocalPath,`quickfile/${req.user?._id}`)

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
        new apiResponse(200, UserCheck, "User registered successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    const {username,password} = req.body??{};

    if(!username||!password){
        throw new apiError(400,"Both username and password are required");
    }

    // Find user by username (case-insensitive)
    const user = await User.findOne({username: username.toLowerCase()});

    if(!user){
        throw new apiError(404,"Username not found. Please check your username or register");
    }

    // Check password
    const isPasswordVaild = await user.isPasswordCorrect(password)
    if(!isPasswordVaild){
        throw new apiError(401,"Incorrect password. Please try again");
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