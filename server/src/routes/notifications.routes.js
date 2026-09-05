import { Router } from "express";
import * as controller from "../controllers/notifications.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get("/", controller.listNotifications);
notificationsRouter.patch("/:id/read", controller.markRead);
notificationsRouter.patch("/read-all", controller.markAllRead);
