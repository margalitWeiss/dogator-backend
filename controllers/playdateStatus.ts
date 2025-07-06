

import { pool } from "../config/db";
import { Request, Response } from "express"
import { CustomRequest } from "../customes/request";

const playdateStatus = async (req: CustomRequest, res: Response) => {
    
    console.log("playdateStatus function called 🌈")

    const playdateId = req.params.id;
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'invalid status' });
    }

    try {
        const [playdate]: any = await pool.query('SELECT * FROM playdates WHERE playdate_id = ?', [playdateId]);

        if (!playdate) {
            res.status(404).json({ message: 'Playdate not found' });
            return;
        }
        //בדיקה שהמשתמש הוא המוזמן
        const currentUserId = req.userAuth?.userId;
        if (playdate.participant_user_id !== currentUserId) {
            return res.status(403).json({ message: 'You are not authorized to change this playdate' });
        }


        await pool.query('UPDATE playdates SET status = ? WHERE playdate_id = ?', [status, playdateId]);

        return res.status(200).json({ message: `Playdate status updated to ${status}` });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
}
export default playdateStatus;


