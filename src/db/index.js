import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB= async()=>{
    try{
    const ConnectionInstance = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
    console.log(`DB connected !!! ${ConnectionInstance.connection.host}`)
    }
    catch(error){
        console.log("mongoDB connection error: ",error);
        process.exit(1);
    }
}

export default connectDB
