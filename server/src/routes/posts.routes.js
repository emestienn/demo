import { Router } from "express";
import * as postsController from "../controllers/posts.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

export const postsRouter = Router();

postsRouter.get("/", optionalAuth, postsController.listFeed);
postsRouter.get("/:id", postsController.getPost);
postsRouter.post("/", requireAuth, postsController.createPost);
postsRouter.delete("/:id", requireAuth, postsController.deletePost);

postsRouter.get("/:id/comments", postsController.listComments);
postsRouter.post("/:id/comments", requireAuth, postsController.createComment);
postsRouter.delete("/:id/comments/:commentId", requireAuth, postsController.deleteComment);
