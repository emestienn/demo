import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin", "moderator"));

adminRouter.get("/stats", adminController.getDashboardStats);
adminRouter.get("/users", adminController.listUsers);
adminRouter.patch("/users/:id/role", requireRole("admin"), adminController.updateUserRole);
adminRouter.patch("/users/:id/suspend", adminController.setUserSuspended);
adminRouter.get("/reports", adminController.listReports);
adminRouter.patch("/reports/:id", adminController.updateReportStatus);
