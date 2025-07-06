import { Response, NextFunction } from "express";
import redis from "../utils/redisClient";
import { CustomRequest } from "../customes/request";
import { sendErrorResponse } from "../utils/errorHandlers";

export const rateLimitMessages = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userAuth?.userId as string;

  if (!userId) {
    sendErrorResponse(res, 401, "ERROR", "Unauthorized");
    return;
  }

  const key = `ratelimit:msg:${userId}`;
  const exists = await redis.exists(key);

  if (exists) {
    sendErrorResponse(res, 429, "ERROR", "Too many messages. Please wait 2 seconds.");
    return;
  }

  await redis.set(key, "1", "EX", 2); 
  next();
};
export const rateLimitReports = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.userAuth?.userId as string;
  

  if (!userId) {
    sendErrorResponse(res, 401, "ERROR", "Unauthorized");
    return;
  }

  const key = `ratelimit:report:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 3600); 
  }

  if (count > 10) {
    sendErrorResponse(res, 429, "ERROR", "Too many reports. Try again later.");
    return;
  }

  next();
};
