
import { Router } from "express";
import { askCoach } from "../controllers/coachController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/chat", protect, askCoach);

export default router;
