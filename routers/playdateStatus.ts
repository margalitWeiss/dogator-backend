

import express, { NextFunction } from "express";
import playdateStatus from "../controllers/playdateStatus";
import { middlewareH, RouteHandler } from "../types/handlers";
import { checkAuth } from "../middlewares/auth";

const router = express.Router();



router.put("playdateStatus/:id",checkAuth, playdateStatus as RouteHandler);

export default router;

