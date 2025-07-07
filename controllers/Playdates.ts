

import { Request, Response, NextFunction } from 'express';
import { pool } from "../config/db";
import { v4 as uuidv4 } from "uuid";



// // יצירת פגישה חדשה
// export const createPlaydate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//     console.log("createPlaydate function called 🐕")
//     try {
//         const { host_user_id, participant_user_id, scheduled_time, status, longitude, latitude } = req.body;

//         if (!host_user_id || !participant_user_id) {
//             return res.status(400).json({
//                 title: "missing data",
//                 message: "please provide host_user_id and  participant_user_id."
//             })
//         }
//         const location = `POINT(${longitude} ${latitude})`;

//         // const sql = `INSERT INTO Playdates ( host_user_id, participant_user_id, scheduled_time, status,location) 
//         //              VALUES (?, ?, ?, ?, ST_GeomFromText(?))`;

//         let sql: string;
//         let values: any[];

//         if (status) {
//             sql = `
//                 INSERT INTO Playdates (host_user_id, participant_user_id, scheduled_time, status, location)
//                 VALUES (?, ?, ?, ?, ?,  ST_GeomFromText(?))
//             `;
//             values = [host_user_id, participant_user_id, scheduled_time, status, location];
//         } else {
//             sql = `
//                 INSERT INTO Playdates (host_user_id, participant_user_id, scheduled_time, location)
//                 VALUES (?, ?, ?, ?, ST_GeomFromText(?))
//             `;
//             values = [host_user_id, participant_user_id, scheduled_time, location];
//         }

//         // const [result]: any = await db.query(sql, [host_user_id, participant_user_id, scheduled_time, status, location]);

//         const [rows]: any = await db.query(`SELECT playdate_id FROM Playdates WHERE host_user_id = ? AND participant_user_id = ? ORDER BY scheduled_time DESC LIMIT 1`, [host_user_id, participant_user_id]);
//         const playdate_id = rows[0]?.playdate_id;
//         const currentStatus = rows[0]?.status;

//         res.status(201).json({ playdate_id, host_user_id, participant_user_id,  scheduled_time, status:currentStatus, location });

//     } catch (err: any) {
//         console.error("error creating a play:", err.message);
//         res.status(500).json({
//             title: "server error",
//             message: "something went wrong. please try again later."
//         })
//     }
// }

export const createPlaydate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("createPlaydate function called 🐕");

    try {
        const { host_user_id, participant_user_id, scheduled_time, status,location_string, longitude, latitude } = req.body;
        console.log(req.body)
        let location;
        console.log("1")

        if (!host_user_id || !participant_user_id) {
            return res.status(400).json({
                title: "missing data",
                message: "please provide host_user_id and participant_user_id."
            });
        }
        console.log("2")

        const allowedStatuses = ["pending", "confirmed", "cancelled"];
        const finalStatus = status || "pending";
        console.log("3")

        if (!allowedStatuses.includes(finalStatus)) {
            return res.status(400).json({
                title: "invalid status",
                message: `status must be one of: ${allowedStatuses.join(", ")}.`
            });
        }
        console.log("4")

        if (longitude !== null && latitude !== null) {
            console.log("5")

             location = `POINT(${longitude} ${latitude})`;
            }
        else{
            console.log("6")

             location = null

            }
            console.log("7")

            const playdateId = uuidv4();

            console.log("8")

        const sql = `
            INSERT INTO playdates (playdate_id,host_user_id, participant_user_id, scheduled_time, status, location,location_string)
            VALUES (?,?, ?, ?, ?, ST_GeomFromText(?),?)
        `;
        const values = [playdateId,host_user_id, participant_user_id, scheduled_time, finalStatus, location,location_string];
        console.log("9")

        const [insertResult]: any = await pool.query(sql, values);

        const [rows]: any = await pool.query(`
            SELECT playdate_id, status FROM Playdates
            WHERE host_user_id = ? AND participant_user_id = ?
            ORDER BY scheduled_time DESC
            LIMIT 1
        `, [host_user_id, participant_user_id]);

        const playdate_id = rows[0]?.playdate_id;
        const currentStatus = rows[0]?.status;

        res.status(201).json({
            playdate_id,
            host_user_id,
            participant_user_id,
            scheduled_time,
            status: currentStatus,
            location,
            location_string
        });

    } catch (err: any) {
        console.error("error creating a play:", err.message);
        res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        });
    }
};

// החזרת כל הפגישות
export const getAllMeetingsWithFilters = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("getAllMeetings function called ❤️");

    try {
        const { user_id } = req.params;
        console.log("User ID from params:", user_id);
        const filter = req.query.filter as string;

        // בסיס השאילתא עם subquery לשם המשתמש השני
        let sql = `
            SELECT 
                p.*, 
                (
                    SELECT u.name 
                    FROM users u 
                    WHERE u.user_id = 
                        CASE 
                            WHEN p.host_user_id = ? THEN p.participant_user_id 
                            ELSE p.host_user_id 
                        END
                ) AS other_user_name
            FROM playdates p
            WHERE (p.host_user_id = ? OR p.participant_user_id = ?)
        `;

        // הוספת סינון לפי פילטר
        if (filter === "upcoming") {
            sql += ` AND p.status = 'confirmed' AND p.scheduled_time > NOW()`;
        } else if (filter === "past") {
            sql += ` AND p.status = 'confirmed' AND p.scheduled_time <= NOW() ORDER BY p.scheduled_time DESC`;
        } else if (filter === "cancelled") {
            sql += ` AND p.status = 'cancelled'`;
        }

        if (filter !== "past") {
            sql += ` ORDER BY p.scheduled_time ASC`;
        }

        const [meetings]: any = await pool.query(sql, [user_id, user_id, user_id]);
        if (meetings.length === 0) {
            return res.status(404).json({ title: "not found", message: "there are no meetings to display for the user." });
        }
        console.log(meetings)
        res.json(meetings);

    } catch (err: any) {
        console.error("error fetching meetings by user id:", err.message);
        res.status(500).json({ title: "server error", message: "something went wrong. please try again later." });
    }
};
//עדכון פגישה
export const updateMeetingByID = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("update meeting function lalalala 🙈")
    try {
        const { id } = req.params;
        const data = req.body;

        if (Object.keys(data).length == 0) {
            return res.status(400).json({
                title: "no data provided",
                message: "please provide at least one field to update."
            })
        }

        const fields = Object.keys(data).map(key => `${key} = ?`).join(", ");
        const values = Object.values(data);

        const sql = `UPDATE playdates SET ${fields} WHERE playdate_id = ?`;
        const [result]: any = await pool.query(sql, [...values, id]);

        if (result.affectedRows == 0) {
            return res.status(404).json({
                title: " meeting not found",
                message: "no meeting  with such id"
            })
        }

        return res.json({ id, ...data });

    } catch (err: any) {
        console.error("can't update meeting", err.message);
        return res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}

// מחיקת פגישה
export const deleteMeetingById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("delete meeting function lalalala")
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ title: "missing ID", message: "meeting id is required." });
    }

    try {
        const [result]: any = await pool.query("DELETE FROM playdates WHERE playdate_id = ?", [id]);

        if (result.affectedRows == 0) {
            return res.status(404).json({ title: "not found", message: "no meeting with such id" });
        }

        res.json({ title: "success", message: `the meeting with the id  ${id} deleted successfully.` });

    } catch (error) {
        console.error("error deleting meeting:", error);
        res.status(500).json({ title: "server Error", message: "something went wrong, please try again later." });
    }
};

