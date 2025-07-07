
import express, { NextFunction } from "express";
import { getNearbyDogs, addDog, getDogByID, updateDogByID, deleteDogById } from "../controllers/dogs";
import retrievingUserIdFromToken from "../middlewares/retrievingUserIdFromToken";
import { searchDogsByLocation,updatePicturePlace } from "../controllers/dogs";
import { checkAuth } from "../middlewares/auth";
import { middlewareH, RouteHandler } from "../types/handlers";

const router = express.Router();

router.get("/nearby",checkAuth as middlewareH, getNearbyDogs as RouteHandler);
router.get("/",searchDogsByLocation)
router.post("/",checkAuth as middlewareH, addDog as RouteHandler);
router.get("/:id",checkAuth as middlewareH, getDogByID as RouteHandler);
router.put("/:id",checkAuth as middlewareH, updateDogByID as RouteHandler);
router.delete("/:id",checkAuth as middlewareH, deleteDogById as RouteHandler);
router.put("/pictures/:id",checkAuth as middlewareH,updatePicturePlace as RouteHandler)


export default router;