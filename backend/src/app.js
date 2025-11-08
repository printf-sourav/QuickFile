import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser';

const app =express();


const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: function(origin, cb) {
    if (!origin) return cb(null, true); // same-origin or curl
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));
app.use(cookieParser());


import userRouter from "./routes/auth.routes.js";
import fileRouter from "./routes/file.routes.js"
import statsRouter from "./routes/stats.routes.js"
import { errorHandler } from "./middleware/error.middleware.js";



app.use("/api/users",userRouter)
app.use("/api/files",fileRouter)
app.use("/api/stats",statsRouter)


app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});


app.use(errorHandler);

export {app};