import {Router} from "express"
import { getUserStats } from "../controllers/stats.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

/**
 * @swagger
 * /api/v1/stats:
 *   get:
 *     summary: Get statistics for the authenticated user
 *     tags:
 *       - Stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */
router.route("/").get(verifyJWT,getUserStats)


export default router;