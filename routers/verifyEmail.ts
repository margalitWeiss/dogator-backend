import express from "express";
import { verifyEmail } from "../controllers/verifyEmail";
import { checkAuth } from "../middlewares/auth";

const router = express.Router();

router.get("/", verifyEmail);

export default router;
