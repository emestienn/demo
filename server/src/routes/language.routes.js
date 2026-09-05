import { Router } from "express";
import * as controller from "../controllers/language.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

export const languageRouter = Router();

languageRouter.get("/lessons", optionalAuth, controller.listLessons);
languageRouter.get("/progress", requireAuth, controller.getProgressSummary);
languageRouter.get("/lessons/:slug", optionalAuth, controller.getLesson);
languageRouter.post("/lessons/:slug/quiz", requireAuth, controller.submitQuiz);
