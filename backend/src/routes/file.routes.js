import { Router } from "express";
import { fileUpload, getFileById ,getAllFiles,deleteFile,downloadFileById} from "../controllers/file.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();


router.route("/upload").post(verifyJWT, upload.single("file"), fileUpload);
router.route("/allfile").get(verifyJWT,getAllFiles)
router.route("/direct-download/:FileId").get(verifyJWT, downloadFileById)
router.route("/:FileId").patch(verifyJWT,getFileById).delete(verifyJWT,deleteFile)

export default router

