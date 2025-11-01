import { Router } from "express";
import { fileUpload, getFileById ,getAllFiles,deleteFile,generateShareLink,downloadViaToken} from "../controllers/file.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();
router.use(verifyJWT)
// secured root


router.route("/upload").post(upload.array("files",5),fileUpload);
router.route("/:FileId").patch(getFileById).delete(deleteFile)
router.route("/allfile").get(getAllFiles)
router.route("/:id/share").post(generateShareLink)
router.route("/download/:token").patch(downloadViaToken)

export default router

