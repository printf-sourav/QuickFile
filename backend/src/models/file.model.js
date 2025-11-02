import mongoose,{Schema} from "mongoose";
import { User } from "./user.model.js";    

const fileSchema = new Schema({
    filename:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    size:{
        type:Number
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    downloadCount:{
        type:Number,
        default: 0
    }
},{timestamps:true})

export const File = mongoose.model("File",fileSchema);