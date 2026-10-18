
import { Router } from "express";
import {
  createRoute,
  deleteRoute,
  listRoutes,
} from "../controllers/routeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Authentication required for all user-specific routes
router.get("/", protect, listRoutes);
router.post("/", protect, createRoute);
router.delete("/:id", protect, deleteRoute);

export default router;
