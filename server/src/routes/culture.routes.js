import { Router } from "express";
import * as controller from "../controllers/culture.controller.js";
import { requireAuth, optionalAuth, requireRole } from "../middleware/auth.middleware.js";

export const cultureRouter = Router();

cultureRouter.get("/", controller.listCulture);
cultureRouter.get("/:slug", optionalAuth, controller.getCulture);
cultureRouter.post("/", requireAuth, requireRole("admin", "moderator"), controller.createCulture);
cultureRouter.patch("/:id", requireAuth, requireRole("admin", "moderator"), controller.updateCulture);
cultureRouter.delete("/:id", requireAuth, requireRole("admin"), controller.deleteCulture);
