import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../customes/request";
import { Response, NextFunction } from "express";
import redis from "../utils/redisClient";
import { checkIfUserBlocked } from "../services/reportsService";

export async function checkAuth(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ title: "user unauthorized", message: "First, log in" });
    return;
  }

  const isBlacklisted = await redis.get(`blacklist:${token}`);
  if (isBlacklisted) {
    res.status(401).json({ title: "Unauthorized", message: "Token is blacklisted" });
    return;
  }
  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) throw new Error("SECRET_KEY is not defined");

    const result = jwt.verify(token, secretKey) as JwtPayload;


    req.userAuth = result;

    const userId = result.user_id;
    const isBlocked = await checkIfUserBlocked(userId);

    if (isBlocked) {
       res.status(403).json({ title: "Blocked", message: "User is blocked by admin" });
       return;
    }


    next();
  } catch (err: any) {
    res.status(401).json({ title: "First, log in", message: "unauthorized " + err.message });
  }
}
