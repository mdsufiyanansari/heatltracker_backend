
import { Router } from "express";
import {
  createActivity,
  deleteActivity,
  listActivities,
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All activity routes require authentication.
router.use(protect);

// Get logged-in user's activities
router.get("/", listActivities);

// Save a completed activity from the frontend
router.post("/", createActivity);

// Delete an activity by ID
router.delete("/:id", deleteActivity);

export default router;
