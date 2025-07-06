
import { pool } from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

export const getUserByEmail = async (email: string) => {
    const [rows]: any[] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows.length ? rows[0] : null;
};
export const updateLastActive = async (email: string) => {

        const query = "UPDATE users SET last_active = NOW() WHERE email = ?";
        
        try {
            await pool.execute(query, [email]);
            console.log(`Updated last_active for ${email}`);
        } catch (error) {
            console.error("Error updating last_active:", error);
        }
    };

    export const updateFcmToken = async (userId: string, fncToken: string) => {

        const query = "UPDATE Users SET Fcm_token = ? WHERE user_id = ?";
    
        try {
            await pool.execute(query, [fncToken, userId]);
            console.log(`Updated fcm_token for user ${userId}`);
        }
        catch (error) {
            console.error("Error updating fncToken:", error);
        }
    };
    
    
    
export const getUsersLocation = async () => {
    const [rows]: any[] = await pool.query("SELECT user_id, location FROM users");
    return rows;
};

export const createUser = async (email: string, hashedPassword: string, Fcm_token: string,role:string) => {
    const userId = uuidv4();
    const [result] = await pool.query(
        "INSERT INTO users (user_id, email, password,Fcm_token,role,created_at,last_active) VALUES (?, ?, ?, ?,?,NOW(),NOW())",
        [userId, email, hashedPassword, Fcm_token,role]
    ) as ResultSetHeader[];

    return { userId, affectedRows: result.affectedRows };
};

export const getNearbyUsersWithDogs = async (
    country: string,
    city: string,
    district: string,
    neighborhood?: string,
    breed?: string,
    temperament?: string,
    ageMin?:number,
    ageMax?:number,
    gender?:string,
    hasPhotos?:boolean
) => {
    let query = `
        SELECT 
            ul.user_id, ul.name, ul.email, ul.profile_image,
            ul.country, ul.city, ul.district, ul.neighborhood,
            d.dog_id, d.name AS dog_name, d.breed,d.age,d.created_at, d.temperament, d.photos,
            CASE 
                WHEN ul.neighborhood = ? THEN 1
                WHEN ul.city = ? THEN 2
                WHEN ul.district = ? THEN 3
                ELSE 4
            END AS priority
        FROM users ul
        JOIN dogs d ON ul.user_id = d.user_id
        WHERE ul.is_banned = false
        AND ul.country = ?
    `;

    const queryParams: any[] = [
        neighborhood || null,
        city,
        district,
        country
    ];

    if (breed?.trim()) {
        query += " AND d.breed = ?";
        queryParams.push(breed.trim());
    }
    if (Array.isArray(temperament) && temperament.length > 0) {
        const trimmedTemperament = temperament.map(t => t.trim()).filter(t => t.length > 0);
        for (const t of trimmedTemperament) {
            query += " AND JSON_CONTAINS(d.temperament, ?)";
            queryParams.push(JSON.stringify([t]));
        }
    }
    
    if (ageMin !== undefined) {
        query += " AND d.age >= ?";
        queryParams.push(ageMin);
    }
    
    if (ageMax !== undefined) {
        query += " AND d.age <= ?";
        queryParams.push(ageMax);
    }
    
    if (gender?.trim()) {
        query += " AND d.gender = ?";
        queryParams.push(gender.trim());
    }
    
    if (hasPhotos !== undefined) {
        query += hasPhotos
            ? " AND JSON_LENGTH(d.photos) > 0"
            : " AND (d.photos IS NULL OR JSON_LENGTH(d.photos) = 0)";
    }
    
    query += " ORDER BY priority ASC, ul.city ASC, ul.name ASC";
    try {
        const [rows] = await pool.query(query, queryParams);
        return rows;
    } catch (error) {
        console.error("Error executing query:", error);
        throw new Error("Error fetching dogs and users.");
    }
};

export const deleteUserByID=async(user_id:string)=>{
    try{
    const query="DELETE FROM users WHERE user_id=?";
    await pool.execute(query,[user_id])
    console.log(`user ${user_id} deleted.`);

    }catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }


}



