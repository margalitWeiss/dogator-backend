import express from "express";
import { submitReport, getAllReports, updateReport, blockUserByAdmin, unblockUserByAdmin, getFilteredReportsController } from "../controllers/reports";
import { isAdmin } from "../middlewares/isAdmin";
import { checkAuth } from "../middlewares/auth";
import { middlewareH, RouteHandler } from "../types/handlers";

const router = express.Router();


router.post("/", checkAuth as middlewareH,submitReport as RouteHandler);
// router.get("/getAllReports",isAdmin as middlewareH, getAllReports as RouteHandler);
router.get("/getAllReports", getAllReports as RouteHandler);
router.put("/updateReport/:id",isAdmin as middlewareH, updateReport as RouteHandler);
router.put("/blockUserByAdmin/:id",isAdmin as middlewareH, blockUserByAdmin as RouteHandler);
router.put("/unblockUserByAdmin/:id", isAdmin as middlewareH,unblockUserByAdmin as RouteHandler);
router.get('/filter',isAdmin as middlewareH ,getFilteredReportsController);


export default router;