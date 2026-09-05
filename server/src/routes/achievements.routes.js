import { Router } from "express";
import { listAchievements } from "../controllers/achievements.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

export const achievementsRouter = Router();

achievementsRouter.get("/", optionalAuth, listAchievements);
