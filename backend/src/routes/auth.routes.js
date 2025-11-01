import { Router } from "express";

import { loginUser, registerUser ,logoutUser,refreshAccessToken} from "../controllers/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router=Router();

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered
 */
router.route("/register").post(upload.single("avatar"),registerUser);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in
 */
router.route("/login").post(loginUser);

//secure routes
/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Logged out
 */
router.route("/logout").post(verifyJWT,logoutUser)

/**
 * @swagger
 * /api/v1/users/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Tokens refreshed
 */
router.route("/refresh").post(verifyJWT,refreshAccessToken)



export default router;