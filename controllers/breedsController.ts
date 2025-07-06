import { Request, Response } from "express";
import { sendErrorResponse } from "../utils/errorHandlers";
import { getBreedsAndSize } from "../services/breedsService";


export const getBreedsWithSize = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await getBreedsAndSize();
        if (!data.length) {
            sendErrorResponse(res, 400, "Error", "No breeds found");
            return;
        }
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching breeds:', error);
        sendErrorResponse(res, 500, "Error", "Error fetching breeds");
    }
};