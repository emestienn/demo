import { Router } from "express";
import * as controller from "../controllers/collections.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

export const collectionsRouter = Router();

collectionsRouter.get("/", requireAuth, controller.listMyCollections);
collectionsRouter.get("/:id", optionalAuth, controller.getCollection);
collectionsRouter.post("/", requireAuth, controller.createCollection);
collectionsRouter.patch("/:id", requireAuth, controller.updateCollection);
collectionsRouter.delete("/:id", requireAuth, controller.deleteCollection);
collectionsRouter.post("/:id/items", requireAuth, controller.addItem);
collectionsRouter.delete("/:id/items/:itemId", requireAuth, controller.removeItem);
collectionsRouter.patch("/:id/reorder", requireAuth, controller.reorderItems);
