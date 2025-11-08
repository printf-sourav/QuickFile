import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();


const rawCors = (process.env.CORS_ORIGIN || '').trim();
const origin = rawCors === '*' ? true : rawCors.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({ origin, credentials: true }));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));
app.use(cookieParser());


import userRouter from "./routes/auth.routes.js";
import fileRouter from "./routes/file.routes.js";
import statsRouter from "./routes/stats.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";



app.use("/api/users", userRouter);
app.use("/api/files", fileRouter);
app.use("/api/stats", statsRouter);


app.get('/ping', (_, res) => res.status(200).send('pong'));


app.use(errorHandler);

export {app};