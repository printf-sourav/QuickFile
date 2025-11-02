import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js" 
import jwt from "jsonwebtoken"
import { sendMail } from "../utils/sendemail.js";

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

    const verifyToken = jwt.sign(
    { _id: user._id },
    process.env.EMAIL_VERIFY_SECRET,
    { expiresIn: "15m" }
    );

    user.emailVerificationToken = verifyToken;
    user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;

    await user.save({validateBeforeSave:false})

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;

    // Send verification email (don't block registration if email fails)
    try {
        await sendMail(
            email,
            "Verify your QuickFile Account",
            `<h2>Welcome to QuickFile!</h2>
             <p>Click below to verify your email:</p>
             <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
             <p>Or copy this link: ${verifyLink}</p>
             <p>This link expires in 15 minutes.</p>`
        );
        console.log('Verification email sent to:', email);
    } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with registration even if email fails
    }

    const UserCheck = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!UserCheck) {
        throw new apiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new apiResponse(200, UserCheck, "User register successfully please check mail to verify")
    )
})

const verifyEmail = asyncHandler(async(req,res)=>{
    const {token} = req.params;

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET);
        console.log('Decoded token:', decoded);

        // Find user by ID from decoded token
        const user = await User.findById(decoded._id);

        if(!user){
            throw new apiError(404, "Invalid token - user not found")
        }

        if(user.emailVerified === true){
            return res.status(200).json(
                new apiResponse(200, null, "Email already verified")
            );
        }

        // Verify the token matches and hasn't expired
        if(user.emailVerificationToken !== token){
            throw new apiError(400, "Invalid verification token")
        }

        if(user.emailVerificationExpires < Date.now()){
            throw new apiError(400, "Verification token has expired")
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({validateBeforeSave: false});

        return res.status(200).json(
            new apiResponse(200, null, "Email verified successfully")
        );
    } catch (error) {
        if(error.name === 'JsonWebTokenError'){
            throw new apiError(400, "Invalid verification token")
        }
        if(error.name === 'TokenExpiredError'){
            throw new apiError(400, "Verification token has expired")
        }
        throw error;
    }
})
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new apiError(400, "Email address is required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
    throw new apiError(400, "Please provide a valid email address");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(404, "No account found with this email address");
  }

  if (user.emailVerified) {
    throw new apiError(400, "This email is already verified. You can login now");
  }


  const verifyToken = jwt.sign(
    { _id: user._id },
    process.env.EMAIL_VERIFY_SECRET,
    { expiresIn: "15m" }
  );

  user.emailVerificationToken = verifyToken;
  user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;

  await sendMail(
    email,
    "Resend: Verify your QuickFile Account",
    `<h2>Hello again from QuickFile 👋</h2>
     <p>Click below to verify your email:</p>
     <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
     <p>Or copy this link: ${verifyLink}</p>
     <p>This link will expire in 15 minutes.</p>`
  );

  res.status(200).json(
    new apiResponse(200, {}, "Verification email resent successfully!")
  );
});

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

    // Check email verification
    if(!user.emailVerified){
        throw new apiError(400,"Email not verified. Please check your email for the verification link")
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

export {registerUser,loginUser,logoutUser,refreshAccessToken,verifyEmail,resendVerificationEmail}