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

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/files",fileRouter)
app.use("/api/v1/stats",statsRouter)

// Swagger UI (API documentation)
// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve raw Swagger JSON for AI or generator tools
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
export {app};