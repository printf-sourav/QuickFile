import { Router } from "express";

import { loginUser, registerUser ,logoutUser,refreshAccessToken} from "../controllers/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router=Router();

router.route("/register").post(upload.single("avatar"),registerUser);
router.route("/login").get(loginUser);

//secure routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh").post(verifyJWT,refreshAccessToken)



export default router;