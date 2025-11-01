import { Router } from "express";
import { fileUpload, getFileById ,getAllFiles,deleteFile,generateShareLink,downloadViaToken} from "../controllers/file.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router = Router();
// secured root

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: Upload files
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded
 */
router.route("/upload").post(upload.array("files",5),verifyJWT,fileUpload);

/**
 * @swagger
 * /api/v1/files/{FileId}:
 *   patch:
 *     summary: Increment download count and get file
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: FileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File fetched
 *   delete:
 *     summary: Delete a file
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: FileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted
 */
router.route("/:FileId").patch(verifyJWT,getFileById).delete(verifyJWT,deleteFile)

/**
 * @swagger
 * /api/v1/files/allfile:
 *   get:
 *     summary: Get all files uploaded by logged in user
 *     tags:
 *       - Files
 *     responses:
 *       200:
 *         description: Files list
 */
router.route("/allfile").get(verifyJWT,getAllFiles)

/**
 * @swagger
 * /api/v1/files/{id}/share:
 *   post:
 *     summary: Generate a shareable short link for a file
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share link created
 */
router.route("/:id/share").post(verifyJWT,generateShareLink)

/**
 * @swagger
 * /api/v1/files/download/{token}:
 *   patch:
 *     summary: Download a file using a share token
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download started
 */
router.route("/download/:token").patch(downloadViaToken)

export default router

