import { Request, Response } from "express";
import { sendErrorResponse } from "../utils/errorHandlers";
import { cntConfirmedPlaydates, cntDogsInProfile, cntPlaydatesInvited, countAllMessagesForUser } from "../services/personalStatisrics";

export const getCntInvitedPlaydates = async (req: Request, res: Response) => {
    const user_id = req.params.userId as string;

    if (!user_id ) {
        sendErrorResponse(res, 400, "Error", "Invalid user id");
         return;
    }

    try {
      const cnt=  await cntPlaydatesInvited(user_id);
         res.status(200).json({ message: `count of invitations: ${cnt}` });
         return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "calculate count of invitations failed.");
         return;
    }
};



export const getCntConfirmedPlaydates = async (req: Request, res: Response) => {
    const user_id = req.params.userId as string;

    if (!user_id ) {
        sendErrorResponse(res, 400, "Error", "Invalid user id");
         return;
    }

    try {
      const cnt=  await cntConfirmedPlaydates(user_id);
         res.status(200).json({ message: `count of confirmed invitations: ${cnt}` });
         return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "calculate count of confirmed paydates failed.");
         return;
    }
};



export const getCntDogsProfiles = async (req: Request, res: Response) => {
    const user_id = req.params.userId as string;

    if (!user_id ) {
        sendErrorResponse(res, 400, "Error", "Invalid user id");
         return;
    }

    try {
      const cnt=  await cntDogsInProfile(user_id);
         res.status(200).json({ message: `count of dogs in your account: ${cnt}` });
         return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "calculate count of dogs failed.");
         return;
    }
};


export const getCntChatMessages = async (req: Request, res: Response) => {
    const user_id = req.params.userId as string;

    if (!user_id ) {
        sendErrorResponse(res, 400, "Error", "Invalid user id");
         return;
    }

    try {
      const cnt=  await countAllMessagesForUser(user_id);
         res.status(200).json({ message: `messages count: ${cnt}` });
         return;
    } catch (err: any) {
        sendErrorResponse(res, 400, "Error", "calculate count of messages failed.");
         return;
    }
};