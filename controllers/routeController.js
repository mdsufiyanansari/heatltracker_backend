
import { z } from "zod";
import mongoose from "mongoose";
import RunningRoute from "../models/RunningRoute.js";

// Coordinate validation
const coordinateSchema = z.object({
  lat: z.coerce.number().finite().min(-90).max(90),
  lng: z.coerce.number().finite().min(-180).max(180),
});

// Route validation
const routeSchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    distanceKm: z.coerce.number().finite().min(0.1).max(500),

    estimatedMinutes: z.coerce
      .number()
      .int()
      .min(1)
      .max(1440)
      .optional(),

    difficulty: z.enum(["Easy", "Moderate", "Hard"]).optional(),

    description: z.string().max(1000).optional(),

    startLocation: z.string().max(200).optional(),

    endLocation: z.string().max(200).optional(),

    startCoordinates: coordinateSchema.nullable().optional(),

    endCoordinates: coordinateSchema.nullable().optional(),

    coordinates: z.array(coordinateSchema).max(1000).optional(),
  })
  .strict();

// Get authenticated user ID
function getUserId(req, res) {
  const userId = req.user?._id || req.user?.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in again.",
    });

    return null;
  }

  return String(userId);
}

// CREATE ROUTE
export async function createRoute(req, res, next) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = routeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message || "Invalid route data.",
      });
    }

    const data = parsed.data;

    // Start and end coordinates are both required
    if (!data.startCoordinates || !data.endCoordinates) {
      return res.status(400).json({
        success: false,
        message: "Start aur end coordinates dono dena zaroori hai.",
      });
    }

    // At least two route points are required
    if (!Array.isArray(data.coordinates) || data.coordinates.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Route map ke liye kam-se-kam 2 coordinates zaroori hain.",
      });
    }

    const start = data.startCoordinates;
    const end = data.endCoordinates;
    const points = data.coordinates;

    // Start and end must be different
    if (start.lat === end.lat && start.lng === end.lng) {
      return res.status(400).json({
        success: false,
        message: "Start aur end location alag honi chahiye.",
      });
    }

    // Coordinate array must begin at the start and end at the finish
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    const samePoint = (a, b) =>
      Math.abs(a.lat - b.lat) < 0.000001 &&
      Math.abs(a.lng - b.lng) < 0.000001;

    if (!samePoint(firstPoint, start) || !samePoint(lastPoint, end)) {
      return res.status(400).json({
        success: false,
        message:
          "Coordinates array ka first point start aur last point end se match hona chahiye.",
      });
    }

    // Save route for the authenticated user
    const route = await RunningRoute.create({
      ...data,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Route created successfully.",
      route,
    });
  } catch (err) {
    next(err);
  }
}

// LIST ROUTES FOR LOGGED-IN USER
export async function listRoutes(req, res, next) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const routes = await RunningRoute.find({
      user: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: routes.length,
      routes,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE ROUTE BELONGING TO LOGGED-IN USER
export async function deleteRoute(req, res, next) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid route ID.",
      });
    }

    const route = await RunningRoute.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Route deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
}
