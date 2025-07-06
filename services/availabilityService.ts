import { pool } from "../config/db";
import { ResultSetHeader } from "mysql2/promise";

interface AvailabilitySlotDB {
  slot_id: string;
  user_id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  specific_date: string | null;
  is_recurring: boolean;
  created_at: Date;
}

interface AvailabilitySlotInput {
  slot_id?: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  specific_date: string | null;
  is_recurring: boolean;
}

export async function deleteAvailabilitySlots(slotIds: string[],userId: string) {
  if (!slotIds || slotIds.length === 0) {
    console.log("No slot IDs provided for deletion. Skipping DELETE operation.");
    return { affectedRows: 0, insertId: 0, warningStatus: 0 } as ResultSetHeader;
  }

  console.log("Attempting to delete slots with IDs:", slotIds, "for User ID:", userId);
  try {
    const [result] = await pool.query( 
      `DELETE FROM AvailabilitySlots WHERE slot_id IN (?) AND user_id = ?`,
      [slotIds, userId] 
    );
    console.log(`Successfully deleted ${result} rows.`);
    return result;
  } catch (error) {
    console.error("Error during deleteAvailabilitySlots:", error);
    throw error; 
  }
}
export async function createAvailabilitySlot(slotData: AvailabilitySlotInput,userId: string) {
    const [result] = await pool.query(
      `INSERT INTO AvailabilitySlots (user_id, day_of_week, start_time, end_time, specific_date, is_recurring, slot_id)
       VALUES (?, ?, ?, ?, ?, ?, UUID())`,
      [userId, slotData.day_of_week, slotData.start_time, slotData.end_time, slotData.specific_date, slotData.is_recurring]
    )as ResultSetHeader[];
    return result;
  }

export async function updateAvailabilitySlot(slotData: AvailabilitySlotInput,userId: string){
  if (!slotData.slot_id) {
    throw new Error('slot_id is required for updating an availability slot.');
  }
  const [result] = await pool.query(
    `UPDATE AvailabilitySlots
     SET day_of_week = ?, start_time = ?, end_time = ?, specific_date = ?, is_recurring = ?
     WHERE slot_id = ? AND user_id = ?`,
    [
      slotData.day_of_week,
      slotData.start_time,
      slotData.end_time,
      slotData.specific_date,
      slotData.is_recurring,
      slotData.slot_id,
      userId,
    ]
  );
  return result;
}

export async function getAvailabilitySlotsByUserId(
  userId: string
): Promise<AvailabilitySlotDB[]> {
  const [rows] = await pool.query(
    `SELECT slot_id, user_id, day_of_week, start_time, end_time, specific_date, is_recurring, created_at
     FROM AvailabilitySlots
     WHERE user_id = ?`,
    [userId]
  );
  return rows as AvailabilitySlotDB[];
}


export const getUserByEmail = async (email: string) => {
    const [rows]: any[] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows.length ? rows[0] : null;
};
export const updateLastActive = async (email: string) => {

        const query = "UPDATE Users SET last_active = NOW() WHERE email = ?";
        
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
            d.dog_id, d.name AS dog_name, d.breed, d.temperament, d.photos,
            CASE 
                WHEN ul.neighborhood = ? THEN 1
                WHEN ul.city = ? THEN 2
                WHEN ul.district = ? THEN 3
                ELSE 4
            END AS priority
        FROM user_locations ul
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

    if (temperament?.trim()) {
        query += " AND JSON_CONTAINS(d.temperament, ?)";
        queryParams.push(JSON.stringify([temperament.trim()]));
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





