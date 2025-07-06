import { Router,Request,Response,NextFunction } from "express";
import { checkAuth } from "../middlewares/auth";
import retrievingUserIdFromToken from "../middlewares/retrievingUserIdFromToken";
// import { isUserBlockedUser } from "../middlewares/isBlocksUsers";
import { countMessagesController, getMessages, postMessage,getChatsForUser } from "../controllers/chatController";
import { middlewareH, RouteHandler } from "../types/handlers";


const chatRouter = Router();



chatRouter.get("/countMessages/:userId",countMessagesController as RouteHandler)//ה-API הדרוש ללקבלת הקריאה הוא: GET api/chat/countMessages/:userId

chatRouter.post("/",checkAuth as middlewareH,postMessage as RouteHandler)
chatRouter.get("/",getMessages as RouteHandler)
chatRouter.get("/user-chats", getChatsForUser as RouteHandler)




export default chatRouter;


