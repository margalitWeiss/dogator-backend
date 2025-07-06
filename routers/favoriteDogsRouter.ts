
import express from "express";

import { checkAuth } from "../middlewares/auth";
import { middlewareH, RouteHandler } from "../types/handlers";
import { addFavoriteDogForUser, removeFavoriteDogForUser } from "../controllers/usersFavoriteDogsController";

const router = express.Router();


router.post("/",addFavoriteDogForUser as RouteHandler);

router.delete("/",removeFavoriteDogForUser as RouteHandler);

export default router;