import express, { NextFunction } from "express";
import { createBreed, deleteBreedById, updateBreed, UserAuthority,getUserByPagination } from "../controllers/managingListsForAdmin";
import { getBreedsWithSize } from "../controllers/breedsController";
import { getBlockedUsers, openReportedUsers } from "../controllers/adminController";
import isAdmin from "../middlewares/isAdmin";
import { middlewareH } from "../types/handlers";

const router = express.Router();


type RouteHandler = (req: express.Request, res: express.Response) => Promise<void>;
type middlwareHandler = (req: express.Request, res: express.Response) => Promise<void>;

router.post("/breeds",isAdmin as middlewareH, createBreed as RouteHandler);
router.delete("/breeds/:id",isAdmin as middlewareH, deleteBreedById as RouteHandler);
router.put("/breeds/:id",isAdmin as middlewareH, updateBreed as RouteHandler);
router.put("/users/:id/role",isAdmin as middlewareH, UserAuthority as RouteHandler);
router.get("/users",isAdmin as middlewareH, getUserByPagination as RouteHandler);
router.get("/breeds",isAdmin as middlewareH, getBreedsWithSize as RouteHandler);



export default router;