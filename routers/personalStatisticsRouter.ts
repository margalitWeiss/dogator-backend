import { Router } from "express";
import { getCntChatMessages, getCntConfirmedPlaydates, getCntDogsProfiles, getCntInvitedPlaydates } from "../controllers/personalStatistics";
import { checkAuth } from "../middlewares/auth";

const personalStatisticsRouter = Router();

personalStatisticsRouter.get("/cntPlaydates/:userId",checkAuth,getCntInvitedPlaydates)
personalStatisticsRouter.get("/cntConfirmedPlaydates/:userId",checkAuth,getCntConfirmedPlaydates)
personalStatisticsRouter.get("/cntChats/:userId",checkAuth,getCntChatMessages)
personalStatisticsRouter.get("/cntDogsProfile/:userId",checkAuth,getCntDogsProfiles)

export default personalStatisticsRouter;