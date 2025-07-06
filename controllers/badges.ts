import { Request, Response } from "express";
import { sendErrorResponse } from "../utils/errorHandlers";
import { addBadge, addBadgeForUser, deleteBadge, getBadges, getUserBadges, isValidHexColor, updateBadge } from "../services/badgesService";
import {validate as uuid} from "uuid"

//add badges
export const addBadgeController = async (req: Request, res: Response) => {
    const name = req.body.name as string;
    const color = req.body.color as string;

    if (!name || !color) {
        sendErrorResponse(res, 400, "Error", "Badge creation failed: 'name' and 'color' are required.");
        return;
    }
    if (!isValidHexColor(color)) {
        sendErrorResponse(res, 400, "Invalid Color", "Badge creation failed: 'color' must be a valid HEX color (e.g. #FFAA00 or #fff).");
        return;
    }
    try {
        await addBadge(name, color);
        res.status(200).json({ message: `add badge succesfully` });
        return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "add badge failed.");
        return;
    }
};


//get all badges
export const getBadgeController = async (req: Request, res: Response) => {
    try {
        const badges = await getBadges();
        res.status(200).json(badges);
        return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "get badge failed.");
        return;
    }
};

//update name or color for the badge
export const updateBadgeController = async (req: Request, res: Response) => {
    const badge_id = req.params.badgeId as string;
    const name = req.body.name;
    const color = req.body.color;
    if (!badge_id||!uuid(badge_id)) {
        res.status(400).json({ error: "badge id is invalid" });
    }
    try {
        await updateBadge(badge_id, { name, color });
        res.status(200).json("update badge succesefulled");
        return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "update badge failed.");
        return;
    }
};


//badging users
export const addBadgeForUserController = async (req: Request, res: Response) => {
    const badge_id = req.params.badgeId as string;
    const user_id = req.params.userId as string;
    if (!user_id||!uuid(user_id)) {
        res.status(400).json({ error: "user id is invalid" });
    }
    if (!badge_id||!uuid(badge_id)) {
        res.status(400).json({ error: "badge id is invalid" });
    }
    try {
        await addBadgeForUser(user_id, badge_id);
        res.status(200).json("add badge for user succesefulled");
        return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "add badge for user failed.");
        return;
    }
};


//get for the user himbadges
export const getBadgeForUserController = async (req: Request, res: Response) => {
    const user_id = req.params.id as string;
    if (!uuid(user_id)) {
        res.status(400).json({ error: "user id is invalid" });
    }
    try {
        const userBadges = await getUserBadges(user_id);
        res.status(200).json(userBadges);
        return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "get badge for user failed.");
        return;
    }
};

//delete badge
export const deleteBadgeController = async (req: Request, res: Response) => {
    const badge_id = req.params.badgeId as string;
    
    if (!badge_id||!uuid(badge_id)) {
        sendErrorResponse(res, 400, "Error", "Badge deletion failed: 'badge_id' is required. or not invalid");
        return;
    }

    try {
        // Assuming you have a function to delete a badge by ID
        await deleteBadge(badge_id);
        res.status(200).json({ message: `Badge with ID ${badge_id} deleted successfully.` });
        return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "delete badge failed.");
        return;
    }
}