import { Response, NextFunction } from 'express';
import { CustomRequest } from '../customes/request';
import { checkIfBlockerOrBlocked } from '../services/userBlockUser';
import { validate as uuid } from "uuid"

//A middleware to valid that blocked users wont can make some things
export const isUserBlockedUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const userId = req.id as string;
    const blockedUserId = req.params.blockedUserId as string;
    try {
        if (!userId || !uuid(userId) || !blockedUserId || !uuid(blockedUserId)) {
            res.status(400).json({ error: "one or both user id is invalid" });
        }
        const isBlocked = await checkIfBlockerOrBlocked(userId, blockedUserId);
        if (isBlocked) {
            res.status(403).json({ error: 'You are blocked by this user or are blocking them.' });
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
