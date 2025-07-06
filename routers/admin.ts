import { Router ,Request,Response,NextFunction} from "express";
import { getBlockedUsers, openReportedUsers } from "../controllers/adminController";
import isAdmin from "../middlewares/isAdmin";
import { blockedManyTimesUsers } from "../services/managmentDashboardService";
import { checkAuth } from "../middlewares/auth";
type hMiddleware =(req: Request, res: Response,next:NextFunction) => Promise<void>;

const adminRout = Router();


adminRout.get("/flagged-users/openReportedUsers",isAdmin as hMiddleware,openReportedUsers as hMiddleware)
adminRout.get("/flagged-users/blockedUsers",isAdmin as hMiddleware,getBlockedUsers as hMiddleware)

export default adminRout;


