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
    },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 2*24*60*60*1000) }
},{timestamps:true})
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const File = mongoose.model("File",fileSchema);