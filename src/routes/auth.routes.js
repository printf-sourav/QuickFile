import { Router } from "express";

import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router=Router();

router.route("/register").post(upload.single("avatar"),registerUser);
router.route("/login").get(loginUser);




export default router;