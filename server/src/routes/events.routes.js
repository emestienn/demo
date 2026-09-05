import { Router } from "express";
import * as controller from "../controllers/events.controller.js";
import { requireAuth, optionalAuth, requireRole } from "../middleware/auth.middleware.js";

export const eventsRouter = Router();

eventsRouter.get("/", controller.listEvents);
eventsRouter.get("/saved/me", requireAuth, controller.listSavedEvents);
eventsRouter.get("/:slug", optionalAuth, controller.getEvent);
eventsRouter.post("/:id/save", requireAuth, controller.toggleSaveEvent);
eventsRouter.post("/", requireAuth, requireRole("admin", "moderator"), controller.createEvent);
eventsRouter.patch("/:id", requireAuth, requireRole("admin", "moderator"), controller.updateEvent);
eventsRouter.delete("/:id", requireAuth, requireRole("admin"), controller.deleteEvent);
