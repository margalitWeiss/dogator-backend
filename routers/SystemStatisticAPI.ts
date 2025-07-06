import express, { NextFunction } from "express";
import { getStatisticalReport } from "../controllers/SystemStatisticsAPI";
import { isAdmin } from "../middlewares/isAdmin";
import { middlewareH, RouteHandler } from "../types/handlers";

const router = express.Router();


router.get("/admin/stats",isAdmin as middlewareH,  getStatisticalReport as RouteHandler);

export default router;
