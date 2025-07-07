
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
console.log("isAdmin function called 🌟");
        if (!token) {
            return res.status(401).json({ message: "no access permission. provide a token." });
        }
    console.log("token is provided", token);
        const retrieval: any = jwt.verify(token, process.env.SECRET_KEY!);
        const role = retrieval.role;
console.log("retrieval id is", role);
        if (role !== "admin") {
            return res.status(403).json({ message: "no access permission.admins only." });
        }
console.log("user is admin, proceeding to next middleware");
        next();
    } catch (err) {
        return res.status(401).json({ message: "invalid token." });
    }
};
export default isAdmin;