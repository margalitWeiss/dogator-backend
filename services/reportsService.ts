import { pool } from "../config/db";
import admin from "../config/firebase";


//calculate count reports for a user
export const countReports = async (user_id: string): Promise<number> => {
    try {
        const query = `SELECT COUNT(*) as count FROM reports WHERE reported_user=?`;
        const [result]: any = await pool.query(query, [user_id]);
        if (result.length === 0) {
            throw { status: 400, title: "function count report failed to count reports" };
        }
        return result[0].count;
    } catch (err: any) {
        console.error("countReport functiion faild:", err.message);
        throw new Error("Failed to count reports for user.");
    }

}

//Automatically block if the user exceeds the reporting threshold
export const autoBlockUser = async (user_id: string): Promise<void> => {
    try {
        const reportingThreshold = parseInt(process.env.REPORT_THRESHOLD as string);
        const reportCount = await countReports(user_id);
        if (reportCount >= reportingThreshold) {
            await blockUser(user_id);
            console.log(`User ${user_id} has been blocked due to exceeding the reporting threshold`);
        }
        else {
            console.log(`User ${user_id} has not been blocked due to not exceeding the reporting threshold. current reports:${reportCount} `);
        }
    } catch (err: any) {
        console.error("AutoBlockUser function failed:", err.message);
        throw new Error("Failed to block the user automatially.");
    }
}

export const blockUser = async (user_id: string): Promise<void> => {
    try {
        //blocking in the DB
        await pool.query("UPDATE users SET is_banned = 1 WHERE user_id = ?", [user_id]);

        // update in firebase realtime database for immediate blocking
        await admin.database().ref(`users_status/${user_id}/blocked`).set(true);

        console.log(`User ${user_id} has been blocked`);
    } catch (err: any) {
        console.error("blockUser failed:", err.message || err);
        throw new Error("Failed to block user.");
    }
};

//A function for unblocking users
export const unblockUser = async (user_id: string): Promise<void> => {
    try {
        //update in the database
        const [result]: any = await pool.query(
            "UPDATE users SET is_banned = 0 WHERE user_id = ?",
            [user_id]
        );

        if (result.affectedRows === 0) {
            throw new Error(`User with ID ${user_id} not found.`);
        }

        // Update firebase realtime DB
        await admin.database().ref(`users_status/${user_id}/blocked`).set(false);

        console.log(`User ${user_id} has been unblocked`);
    } catch (err: any) {
        console.error("unblockUser failed:", err.message || err);
        throw new Error("Failed to unblock user.");
    }
};
//Middleware helper function to check whether the user is blocked in the system
export const checkIfUserBlocked = async (userId: string): Promise<boolean> => {
    const [rows]: any = await pool.query("SELECT is_banned FROM users WHERE user_id = ?", [userId]);
    return rows.length > 0 && rows[0].is_banned;
  };
  //Delete the user reports
  export const deleteReportsById = async (user_id: string) => {
    try {
        const query = "DELETE FROM reports WHERE reported_by  =? OR reported_user  =?";
        await pool.execute(query, [user_id, user_id])
        console.log(`All reports for user ${user_id} deleted.`);

    } catch (error) {
        console.error("Error deleting reports:", error);
        throw error;
    }

}



//Filter the reports with some filteres
export const fetchFilteredReports = async (
    byCountReports?: number,
    missingProfilePic?: boolean,
    missingProfileDetails?: boolean
) => {
    if (!byCountReports && !missingProfilePic && !missingProfileDetails) {
        return [];
    }

    let query = "";
    let params: any[] = [];

    try {
        if (byCountReports) {
            query = `
                SELECT 
                    u.user_id,
                    u.name,
                    u.email,
                    u.is_banned,
                    COUNT(r.report_id) AS reports_count
                FROM users u
                LEFT JOIN reports r ON u.user_id = r.reported_user
                GROUP BY u.user_id
                HAVING reports_count >= ?
                ORDER BY reports_count DESC;
            `;
            params.push(byCountReports);
        }
        else if (missingProfilePic) {
            query = `
                SELECT DISTINCT u.*
                FROM users u
                LEFT JOIN dogs d ON u.user_id = d.user_id
                WHERE u.profile_image IS NULL
                      OR u.profile_image = ''
                      OR u.profile_image = 'default.jpg'
                      OR d.image IS NULL
                      OR JSON_LENGTH(d.image) = 0;
            `;
        }
        else if (missingProfileDetails) {
            query = `
                SELECT *
                FROM users
                WHERE 
                    name IS NULL OR name = ''
                    OR email IS NULL OR email = ''
                    OR phone IS NULL OR phone = ''
                    OR bio IS NULL OR bio = ''
                    OR profile_image IS NULL OR profile_image = '' OR profile_image = 'default.jpg';
            `;
        }

        const [rows] = await pool.query(query, params);
        return rows;
    } catch (error) {
        console.error('Error fetching filtered reports:', error);
        throw error;
    }





};


