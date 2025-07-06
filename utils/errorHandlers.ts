import { Response } from "express";

export const sendErrorResponse = (res: Response, status: number, title: string, message: string) => {
    return res.status(status).json({ title, message });
};