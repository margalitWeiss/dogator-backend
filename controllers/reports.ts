import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { v4 as uuidv4 } from 'uuid';
import { autoBlockUser, blockUser, fetchFilteredReports, unblockUser } from "../services/reportsService";
import { validate as uuid } from "uuid"

// יצירת דיווח חדש
export const submitReport = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    console.log("submitReport function called 🦉")
    const allowedReasons = [
        "Offensive language / Verbal abuse",
        "Harassment / Spam",
        "False information / Impersonation",
        "Scam / Requesting money",
        "Irrelevant user",
        "Other"
    ];
    try {
        console.log("submitReport function called 🦉")
        const { reported_by, reported_user, context_type, message_id, reason, description } = req.body;
        //Make sure that a reason exists and is one of the allowed categories
        if (!reason || !allowedReasons.includes(reason)) {
            return res.status(400).json({
                title: "invalid reason",
                message: `reason must be included in: ${allowedReasons.join(",")}`
            })
        }
        const report_id = uuidv4();

        //בדיקה שהנתונים הנדרשים קיימים חוץ מ reason שנבדק למעלה
        if (!reported_by || !reported_user || !context_type) {
            return res.status(400).json({
                title: "missing data",
                message: "please provide reported_by, reported_user,context_type, reason."
            })
        }
        // Check that if reason contains the value "Other: then description cannot be empty
        // If it is empty then return an error
        if (reason === "other" && !description) {
            return res.status(400).json({
                title: "missing description",
                message: "please provide description for the reason 'other'"
            })
        }
        const sql = `INSERT INTO reports ( report_id,reported_by, reported_user, context_type,  message_id, reason,description,status) 
                     VALUES (?,?, ?, ?, ?, ?, ?, 'open')`;

        const [result]: any = await pool.query(sql, [report_id, reported_by, reported_user, context_type, message_id || null, reason, description || null]);
        //Automatically block if the user exceeds the reporting threshold
        await autoBlockUser(reported_user);
        return res.status(201).json({
            message: "Report submitted successfully",
            report_id, reported_by, reported_user, context_type, message_id: message_id || null, reason, description: description || null
        });

    } catch (err: any) {
        console.error("error creating a report:", err.message);
        res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}

//שליפת הדיווחים
export const getAllReports = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("getAllReports function called 🦉")

    try {
        const sql = `SELECT
                     r.*,
                     u1.name AS reported_by_name,
                     u2.name AS reported_user_name,
                     u2.is_banned AS is_reported_user_banned -- הוספת השדה is_banned
                     FROM
                         reports r
                     JOIN
                         users u1 ON r.reported_by = u1.user_id
                     JOIN
                         users u2 ON r.reported_user = u2.user_id
                     ORDER BY
                         r.timestamp DESC;`;
        const [reports]: any = await pool.query(sql);

        return res.status(200).json(reports);
    }
    catch (err: any) {
        console.log("error fetching reports:", err.messege);
        return res.status(500).json({
            title: "server error",
            messege: "something went wrong, please try again later."
        })
    }
}

//in this function the reports updates automatic if its open he will be updated to reviewed
// if its reviewed he will be updated to closed 
export const updateReport = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("update report function lalalala 🙈")
    try {
        const { id } = req.params;
        // const { status } = req.body;
        const [rows]: any = await pool.query("SELECT status FROM reports WHERE report_id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                title: "report not found",
                message: "no report with such id"
            });
        }
        if (rows[0].status === "closed") {
            return res.status(400).json({
                title: "report already closed",
                message: "this report is already closed and cannot be updated."
            });
        }
        let status = "reviewed";
        if (rows[0].status === "reviewed") {
            status = "closed";
        }
        const sql = `UPDATE reports SET status= ? WHERE report_id = ?`;
        const [result]: any = await pool.query(sql, [status, id]);
        return res.json({ id, status });

    } catch (err: any) {
        console.error("can't update report", err.message);
        return res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}

//blocking user by admin
export const blockUserByAdmin = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const id = req.params.id as string;

        if (!id || !uuid(id)) {
            res.status(400).json({ error: "user id is invalid" });
        }
        await blockUser(id);
        return res.status(200).json({
            message: "user blocked successfully",
            user_id: id
        })
    }
    catch (err: any) {
        console.error("error blocking user:", err.message);
        res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}


export const unblockUserByAdmin = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const id = req.params.id;
        if (uuid(id)) {
            res.status(400).json({ error: "user id is invalid" });
        }
        await unblockUser(id);
        return res.status(200).json({
            message: "user unblocked successfully",
            user_id: id
        })
    }
    catch (err: any) {
        console.error("error unblocking user:", err.message);
        res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}


export const getFilteredReportsController = async (req: Request, res: Response) => {
    try {
        const byCountReports = req.query.byCountReports ? Number(req.query.byCountReports) : undefined;

        const missingProfilePic = req.query.missingProfilePic === 'true';

        const missingProfileDetails = req.query.missingProfileDetails === 'true';
        const users = await fetchFilteredReports(byCountReports, missingProfilePic, missingProfileDetails);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch filtered reports' });
    }
};