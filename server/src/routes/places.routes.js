import { Router } from "express";
import * as placesController from "../controllers/places.controller.js";
import * as reviewsController from "../controllers/reviews.controller.js";
import { requireAuth, optionalAuth, requireRole } from "../middleware/auth.middleware.js";

export const placesRouter = Router();

placesRouter.get("/", placesController.listPlaces);
placesRouter.get("/:slug", optionalAuth, placesController.getPlace);
placesRouter.post("/", requireAuth, requireRole("admin", "moderator"), placesController.createPlace);
placesRouter.patch("/:id", requireAuth, requireRole("admin", "moderator"), placesController.updatePlace);
placesRouter.delete("/:id", requireAuth, requireRole("admin"), placesController.deletePlace);

placesRouter.post("/:placeId/reviews", requireAuth, reviewsController.createReview);
placesRouter.delete("/reviews/:id", requireAuth, reviewsController.deleteReview);
