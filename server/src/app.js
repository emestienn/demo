import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { citiesRouter } from "./routes/cities.routes.js";
import { neighborhoodsRouter } from "./routes/neighborhoods.routes.js";
import { placesRouter } from "./routes/places.routes.js";
import { foodRouter } from "./routes/food.routes.js";
import { cultureRouter } from "./routes/culture.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { postsRouter } from "./routes/posts.routes.js";
import { likesRouter } from "./routes/likes.routes.js";
import { collectionsRouter } from "./routes/collections.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { languageRouter } from "./routes/language.routes.js";
import { achievementsRouter } from "./routes/achievements.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import { activityRouter } from "./routes/activity.routes.js";
import { recommendationsRouter } from "./routes/recommendations.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.use("/uploads", express.static(path.resolve("uploads")));

  app.get("/health", (_req, res) => {
    res.json({ success: true, service: "dongne-api", status: "ok" });
  });

  app.use("/api/v1", apiLimiter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/cities", citiesRouter);
  app.use("/api/v1/neighborhoods", neighborhoodsRouter);
  app.use("/api/v1/places", placesRouter);
  app.use("/api/v1/food", foodRouter);
  app.use("/api/v1/culture", cultureRouter);
  app.use("/api/v1/events", eventsRouter);
  app.use("/api/v1/posts", postsRouter);
  app.use("/api/v1/likes", likesRouter);
  app.use("/api/v1/collections", collectionsRouter);
  app.use("/api/v1/notifications", notificationsRouter);
  app.use("/api/v1/language", languageRouter);
  app.use("/api/v1/achievements", achievementsRouter);
  app.use("/api/v1/search", searchRouter);
  app.use("/api/v1/activity", activityRouter);
  app.use("/api/v1/recommendations", recommendationsRouter);
  app.use("/api/v1/ai", aiRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/reports", reportsRouter);
  app.use("/api/v1/upload", uploadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
