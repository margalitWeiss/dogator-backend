import { Router } from "express";
import {  blockUser, getMyBlockedUsers, unBlokingUser } from "../controllers/userBlockUser";
import { checkAuth } from "../middlewares/auth";

const blockUserRouter=Router();


blockUserRouter.post("/:blockerUserId/:blockedUserId",checkAuth, blockUser)
blockUserRouter.delete("/:blockerUserId/:blockedUserId",checkAuth,unBlokingUser)
blockUserRouter.get("/myBlocked/:userId",checkAuth,getMyBlockedUsers)




export default blockUserRouter;