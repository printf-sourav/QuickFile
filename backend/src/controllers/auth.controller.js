import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import { uploadToSupabase, getSupabaseFileURL } from "../utils/superbase.js"
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
    if(password.length < 6){
        throw new apiError(400,"Password must be at least 6 characters long");
    }
    const existingUsername = await User.findOne({username: username.toLowerCase()});
    if(existingUsername){
        throw new apiError(409,"Username already taken. Please choose another username");
    }
    const existingEmail = await User.findOne({email});
    if(existingEmail){
        throw new apiError(409,"Email already registered. Please login or use another email");
    }

    const user = await User.create({
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
    
    const {email,password} = req.body??{};

    if(!email||!password){
        throw new apiError(400,"Both email and password are required");
    }

    const user = await User.findOne({email:email.toLowerCase()});

    
    if(!user){
        throw new apiError(401,"Wrong email or password");
    }

    const isPasswordVaild = await user.isPasswordCorrect(password)
    if(!isPasswordVaild){
        throw new apiError(401,"Wrong email or password");
    }

    const {accessToken,refreshToken} = await generateNewAccessAndRefreshToken(user._id)

    // Use existing user object instead of extra DB query
    const loggedInUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
    const isProd = process.env.NODE_ENV === 'production'
    const accessMaxAgeMs = 24 * 60 * 60 * 1000; 
    const refreshMaxAgeMs = 10 * 24 * 60 * 60 * 1000; 
    const baseCookie = {
        httpOnly: true,
        secure: isProd, 
        sameSite: isProd ? 'None' : 'Lax'
    }

    return res.status(200)
    .cookie("accessToken",accessToken,{ ...baseCookie, maxAge: accessMaxAgeMs })
    .cookie("refreshToken",refreshToken,{ ...baseCookie, maxAge: refreshMaxAgeMs })
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
    const isProd = process.env.NODE_ENV === 'production'
    const option={
        httpOnly:true,
        secure:isProd,
        sameSite: isProd ? 'None' : 'Lax'
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

        const isProd = process.env.NODE_ENV === 'production'
        const options = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Lax'
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