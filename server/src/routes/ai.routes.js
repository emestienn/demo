import { Router } from "express";
import { askAssistant } from "../controllers/ai.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

export const aiRouter = Router();

const aiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 12 });

aiRouter.post("/itinerary", aiLimiter, optionalAuth, askAssistant);
