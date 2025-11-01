import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser';
const app =express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb" 
}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))
app.use(cookieParser()) 


import userRouter from "./routes/auth.routes.js";
import fileRouter from "./routes/file.routes.js"

import statsRouter from "./routes/stats.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/files",fileRouter)
app.use("/api/v1/stats",statsRouter)
export {app};