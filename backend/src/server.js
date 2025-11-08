import connectDB from "./db/index.js";
import {app} from "./app.js"
import dotenv from "dotenv";
import {startCleanupJob} from "./services/cleanup.services.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(async ()=>{
    const PORT = process.env.PORT || 8000;
    
    app.listen(PORT, '0.0.0.0', ()=>{
        console.log(`Server is running at port ${PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!!",err);
})

startCleanupJob();


