import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";
import { report } from "process";

export const getStatisticalReport = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    console.log("getStatisticalReport function called 🥰");

    try {
        const sql = `
    SELECT
    (SELECT COUNT (*) FROM users) AS totalUsers,
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS lastWeekUsers,
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AS lastMonthUsers,
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) AS lastYearUsers,

    (SELECT COUNT (*) FROM dogs) AS totalDogs,
    (SELECT COUNT(*) FROM dogs WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS lastWeekDogs,
    (SELECT COUNT(*) FROM dogs WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AS lastMonthDogs,
    (SELECT COUNT(*) FROM dogs WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)) AS lastYearDogs,

   
    (SELECT COUNT (*) FROM reports WHERE status = 'open') AS openReports,
    (SELECT COUNT (*) FROM reports WHERE status = 'reviewed') AS reviewedReports,
    (SELECT COUNT (*) FROM reports WHERE status = 'closed') AS closedReports
    `;

        const [result]: any = await pool.query(sql);

        if (result.length === 0) {
            return res.status(404).json({
                title: "no data found",
                message: "No suitable statistical segmentation found.."
            });
        }

        const stats = result[0];

        const response = {

            users: {
                total: stats.totalUsers,
                last_week: stats.lastWeekUsers,
                last_month: stats.lastMonthUsers,
                las_year: stats.lastYearUsers

            },
            dogs: {
                total: stats.totalDogs,
                last_week: stats.lastWeekDogs,
                last_month: stats.lastMonthDogs,
                las_year: stats.lastYearDogs
            },
            // messeages: {
            //     fromTodayMessegaes: stats.fromTodayMessegas,
            //     lastWeekMessages: stats.lastMonthMessegas,
            //     lastMonthMesseages: stats.lastMonthMesseages
            // },
            reports: {
                open: stats.openReports,
                reviewed: stats.reviewedReports,
                closed: stats.closedReports
            }
        }

        return res.status(200).json({
            message: "the statistical report:",
            data: response
        })

    }

    catch (err: any) {
        console.log("error returning statistics report to admin", err.message);
        return res.status(500).json(
            {
                title: "server error",
                message: "something went wrong, please try again later."
            }
        )
    }


}