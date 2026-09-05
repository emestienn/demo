import { Router } from "express";
import * as controller from "../controllers/food.controller.js";
import { requireAuth, optionalAuth, requireRole } from "../middleware/auth.middleware.js";

export const foodRouter = Router();

foodRouter.get("/", controller.listFood);
foodRouter.get("/:slug", optionalAuth, controller.getFood);
foodRouter.post("/", requireAuth, requireRole("admin", "moderator"), controller.createFood);
foodRouter.patch("/:id", requireAuth, requireRole("admin", "moderator"), controller.updateFood);
foodRouter.delete("/:id", requireAuth, requireRole("admin"), controller.deleteFood);
