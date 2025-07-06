import { Router } from "express";
import { addBadgeController, addBadgeForUserController, deleteBadgeController, getBadgeController, getBadgeForUserController, updateBadgeController } from "../controllers/badges";
import { updateBadge } from "../services/badgesService";
import isAdmin from "../middlewares/isAdmin";
import { checkAuth } from "../middlewares/auth";
import { middlewareH } from "../types/handlers";

const badgesRouter=Router();



badgesRouter.post("/",isAdmin as middlewareH,addBadgeController)
badgesRouter.get("/",isAdmin as middlewareH,getBadgeController)
badgesRouter.put("/:badgeId",isAdmin as middlewareH,updateBadgeController)
badgesRouter.post("/:userId/:badgeId",isAdmin as middlewareH,addBadgeForUserController)
badgesRouter.delete("/:badgeId",isAdmin as middlewareH,deleteBadgeController)
badgesRouter.get("/:id/badges",checkAuth,getBadgeForUserController)

export default badgesRouter;