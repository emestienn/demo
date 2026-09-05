import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.js";

export const usersRouter = Router();

usersRouter.patch("/me", requireAuth, usersController.updateMe);
usersRouter.post("/me/avatar", requireAuth, upload.single("avatar"), usersController.uploadAvatar);
usersRouter.post("/me/cover", requireAuth, upload.single("cover"), usersController.uploadCover);
usersRouter.get("/me/saved-places", requireAuth, usersController.listSavedPlaces);
usersRouter.post("/me/saved-places/:placeId", requireAuth, usersController.toggleSavePlace);

usersRouter.get("/:username", optionalAuth, usersController.getPublicProfile);
usersRouter.get("/:username/posts", usersController.getUserPosts);
usersRouter.get("/:username/collections", optionalAuth, usersController.getUserCollections);
usersRouter.get("/:username/followers", usersController.listFollowers);
usersRouter.get("/:username/following", usersController.listFollowing);
usersRouter.post("/:username/follow", requireAuth, usersController.followUser);
usersRouter.delete("/:username/follow", requireAuth, usersController.unfollowUser);
