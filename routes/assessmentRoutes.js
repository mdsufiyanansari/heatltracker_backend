import { Router } from "express";
import { generateAssessment, latestAssessment } from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = Router();
router.use(protect);
router.post("/", generateAssessment);
router.get("/latest", latestAssessment);
export default router;
