import mongoose,{Schema} from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
        index: true
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    },
},{timestamps:true})

UserSchema.pre("save",async function (next){
    try {
        if (!this.isModified('password')) return next();
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (err) {
        next(err);
    }
})

UserSchema.methods.isPasswordCorrect= async function (password){
    return await bcrypt.compare(password,this.password);
}

UserSchema.methods.generateNewAccessToken = async function (){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email
    },process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
})
}

UserSchema.methods.generateNewRefreshToken = async function(){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email
    },process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
})
}
export const User = mongoose.model("User",UserSchema)


