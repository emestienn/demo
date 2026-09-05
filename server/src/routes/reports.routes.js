import { Router } from "express";
import { createReport } from "../controllers/reports.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const reportsRouter = Router();

reportsRouter.post("/", requireAuth, createReport);
