import { Router } from "express";
import { getMyActivity } from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const activityRouter = Router();

activityRouter.get("/me", requireAuth, getMyActivity);
