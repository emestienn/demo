import { Router } from "express";
import { getDiscoverFeed } from "../controllers/recommendations.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

export const recommendationsRouter = Router();

recommendationsRouter.get("/discover", optionalAuth, getDiscoverFeed);
