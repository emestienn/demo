import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

export const searchRouter = Router();

searchRouter.get("/", optionalAuth, globalSearch);
