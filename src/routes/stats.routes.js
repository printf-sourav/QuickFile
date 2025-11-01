import {Router} from "express"
import { getUserStats } from "../controllers/stats.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/").get(verifyJWT,getUserStats)


export default router;