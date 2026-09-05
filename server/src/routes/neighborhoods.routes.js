import { Router } from "express";
import * as controller from "../controllers/neighborhoods.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const neighborhoodsRouter = Router();

neighborhoodsRouter.get("/", controller.listNeighborhoods);
neighborhoodsRouter.get("/:slug", controller.getNeighborhood);
neighborhoodsRouter.post("/", requireAuth, requireRole("admin", "moderator"), controller.createNeighborhood);
neighborhoodsRouter.patch("/:id", requireAuth, requireRole("admin", "moderator"), controller.updateNeighborhood);
neighborhoodsRouter.delete("/:id", requireAuth, requireRole("admin"), controller.deleteNeighborhood);
