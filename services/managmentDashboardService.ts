import { pool } from "../config/db"


export const getUsersWithOpenReports = async (): Promise<any> => {
    try {
        const query = `SELECT u.name,u.email,r.open_reports_count FROM users u JOIN 
                   (SELECT 
                       reported_user,
                       COUNT(*) AS open_reports_count
                   FROM 
                       Reports
                   WHERE 
                       status != 'closed'
                   GROUP BY 
                       reported_user
                   HAVING 
                       COUNT(*) >= 3) r ON u.user_id=r.reported_user `
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error fetching users with more than 3 reports:', error);
    }

}

export const blockedManyTimesUsers = async (): Promise<any> => {
    console.log("blockedManyTimesUsers function ❤️")
    try{
        const query = `SELECT 
                      u.user_id,
                      u.email,
                      b.countBlocks
                  FROM 
                      users u
                  JOIN (
                      SELECT 
                          blocked_id, 
                          COUNT(*) AS countBlocks
                      FROM 
                          blocked_users
                      GROUP BY 
                          blocked_id
                  ) b ON b.blocked_id = u.user_id
                  ORDER BY 
                      b.countBlocks DESC;
                  `;
    const [rows] = await pool.query(query);
    return rows;
    }catch (error) {
        console.error('Error fetching users that are blocked:', error);
    }
}