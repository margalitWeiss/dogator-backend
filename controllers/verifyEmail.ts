import { Request, Response } from "express";
import { verifyEmailByToken } from "../services/emailVerificationService";
import { sendErrorResponse } from "../utils/errorHandlers";

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
        sendErrorResponse(res, 400, "Error", "Invalid token");
         return;
    }

    try {
        await verifyEmailByToken(token);
         res.status(200).json({ message: "Email verified successfully!" });
         return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "Email verification failed.");
         return;
    }
};
