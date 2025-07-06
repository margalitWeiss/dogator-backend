import { Router } from "express";
import { getBreedsWithSize } from "../controllers/breedsController";
import { checkAuth } from "../middlewares/auth";
import { middlewareH } from "../types/handlers";

const router = Router();

router.get("/",checkAuth as middlewareH,getBreedsWithSize)

export default router;