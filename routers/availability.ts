import { Router } from "express";
import { updateUserAvailability,getUserAvailability } from "../controllers/availability";
import { checkAuth } from "../middlewares/auth";

const router = Router();

router.put("/",checkAuth,updateUserAvailability)
router.get("/:userId",checkAuth,getUserAvailability)

export default router;