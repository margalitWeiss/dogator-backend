import express,{ Express } from "express";
import { testConnection } from "./config/db";
import breedsRouter from "./routers/breedsRouter"
import dogsRouter from "./routers/dogs";
import playdateStatusRouter from "./routers/playdateStatus";
import userRouter from "./routers/user";
import reportsRouter from "./routers/reports";
import playdateRouter from "./routers/Playdates";
import cors from "cors"
import notificationRoutes from './routers/notificationRoutes';
import verifyEmailRoutes from './routers/verifyEmail';
import availabilityRouter from './routers/availability';
import statsRouter from "./routers/SystemStatisticAPI";
import adminRout from "./routers/admin";
import chatRouter from "./routers/chatRouter";
import addFeedbackReplyRouter from "./routers/feedbackReply";
import personalStatisticsRouter from "./routers/personalStatisticsRouter";
import managingListsForAdminRouter from "./routers/managingListsForAdmin";
import badgesRouter from "./routers/badges";
import dotenv from "dotenv";
import blockUserRouter from "./routers/blockUser";
import favoriteDogsRouter from "./routers/favoriteDogsRouter"

dotenv.config();

testConnection();
const app:Express=express();
app.use(express.json());
app.use(cors())

app.use("/api/user", userRouter);
app.use("/api/breeds",breedsRouter);
app.use('/notifications', notificationRoutes);
app.use("/api", playdateStatusRouter);
app.use("/api/dogs", dogsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/playdates", playdateRouter);
app.use("/api/users", userRouter)
app.use("/api/verify-email", verifyEmailRoutes)
app.use("/api/statistics", statsRouter);
app.use("/api/admin", adminRout)
app.use('/api/chat',chatRouter)
app.use('/api/personalStatistics',personalStatisticsRouter)
app.use("/api/addFeedbackReply", addFeedbackReplyRouter);
app.use("/api/ManagementList", managingListsForAdminRouter);
app.use("/api/blockUser",blockUserRouter)
app.use("/api/availability", availabilityRouter);
app.use("/api/badges",badgesRouter)
app.use("/api/favoriteDogs",favoriteDogsRouter)

let port = process.env.PORT ? Number(process.env.PORT) : 3306;

app.listen(port, '0.0.0.0', () => {
    console.log("app is runing on port " + port)
})
