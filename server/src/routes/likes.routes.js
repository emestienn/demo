import { Router } from "express";
import { toggleLike } from "../controllers/likes.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const likesRouter = Router();

likesRouter.post("/:targetType/:targetId", requireAuth, toggleLike);
