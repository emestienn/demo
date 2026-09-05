import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validateRegister, validateLogin } from "../validators/auth.validators.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validateRegister, authController.register);
authRouter.post("/login", authLimiter, validateLogin, authController.login);
authRouter.get("/me", requireAuth, authController.me);
