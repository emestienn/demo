import { Router } from "express";
import * as citiesController from "../controllers/cities.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const citiesRouter = Router();

citiesRouter.get("/", citiesController.listCities);
citiesRouter.get("/:slug", citiesController.getCity);
citiesRouter.post("/", requireAuth, requireRole("admin"), citiesController.createCity);
citiesRouter.patch("/:id", requireAuth, requireRole("admin"), citiesController.updateCity);
citiesRouter.delete("/:id", requireAuth, requireRole("admin"), citiesController.deleteCity);
