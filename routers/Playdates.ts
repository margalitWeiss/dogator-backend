import express from "express";
import { createPlaydate, deleteMeetingById, updateMeetingByID, getAllMeetingsWithFilters } from "../controllers/Playdates";
// import { isUserBlockedBUser } from "../middlewares/isBlocksUsers";
import { middlewareH, RouteHandler } from "../types/handlers";
import { checkAuth } from "../middlewares/auth";

const router = express.Router();


router.post("/",checkAuth as middlewareH, createPlaydate as RouteHandler);
router.delete("/:id",checkAuth as middlewareH, deleteMeetingById as RouteHandler);
router.put("/:id",checkAuth as middlewareH, updateMeetingByID as RouteHandler);
router.get("/:user_id",checkAuth as middlewareH, getAllMeetingsWithFilters as RouteHandler);

export default router;