
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "no access permission. provide a token." });
        }

        const retrieval: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = retrieval.id;

        const [user]: any = await pool.query("SELECT role FROM users WHERE id = ?", [userId]);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "no access permission.admins only." });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "invalid token." });
    }
};
export default isAdmin;