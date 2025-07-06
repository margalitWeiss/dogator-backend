
import { CustomRequest } from "../customes/request";
import { Request, Response } from "express";
import { deleteBlockUser, getMyBlockedService, userBlockUser } from "../services/userBlockUser";
import { error } from "console";
import { validate as uuid } from "uuid"

export const blockUser = async (req: Request, res: Response) => {
    const blockerUserId = req.params.blockerUserId;
    const blockedUserId = req.params.blockedUserId;
    const deleteChat = req.body.deleteChat ?? false;
    try {
        //לוודא ש-blockerUserId הוא מחרוזת
        if (!blockerUserId || !uuid(blockerUserId) || !blockedUserId || !uuid(blockedUserId)) {
            res.status(400).json({ error: "one or both user id is invalid" });
        }
        else {
            await userBlockUser(blockerUserId, blockedUserId, deleteChat)
            res.status(200).json({ message: "user blocked successfully" });
        }

    }
    catch (err) {
        console.error("Error blocking user:", err)
        res.status(500).json({ error: "failed to block user" });
    }

}

export const unBlokingUser = async (req: CustomRequest, res: Response) => {
    const blockerUserId = req.params.blockerUserId;
    const blockedUserId = req.params.blockedUserId;
    // const deleteChat = req.body.deleteChat;
    try {
        //לוודא ש-blockerUserId הוא מחרוזת
        if (!blockerUserId || !uuid(blockerUserId) || !blockedUserId || !uuid(blockedUserId)) {
            res.status(400).json({ error: "one or both user id is invalid" });
        }
        else {
            await deleteBlockUser(blockerUserId, blockedUserId)
            res.status(200).json({ message: "user  blocked deleted successfully" });
        }

    }
    catch (err) {
        console.error("Error blocking user:", err)
        res.status(500).json({ error: "failed to delete block user" });
    }

}



export const getMyBlockedUsers = async (req: CustomRequest, res: Response) => {
    const userId = req.params.userId;
    try {
        //לוודא ש-blockerUserId הוא מחרוזת
        if (!userId||!uuid(userId)) {
        res.status(400).json({ error: "user id is invalid" });
    }
        else {
            const myBlocked = await getMyBlockedService(userId)
            console.table(myBlocked);

            res.status(200).json(myBlocked);
        }

    }
    catch (err) {
        console.error("Error get blocked users user:", err)
        res.status(500).json({ error: "failed to get your blocked user" });
    }

}
