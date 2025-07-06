
import { pool } from "../config/db";
import { RowDataPacket } from 'mysql2';


type Playdate = {
    playdate_id: string;
    host_user_id: string;
    participant_user_id: string;
    location: string; 
    scheduled_time: Date;
    status: string;
    created_at?: Date;
  };
  
export async function getPlaydatesForToday(date: Date): Promise<Playdate[]> {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM playdates WHERE scheduled_time BETWEEN ? AND ?`,
    [startOfDay, endOfDay]
  );

  return rows as Playdate[];
}


export const deletePlayDatesById=async(user_id:string)=>{
    try{
    const query="DELETE FROM playDates WHERE host_user_id=? OR participant_user_id =?";
    await pool.execute(query,[user_id,user_id])
    console.log(`All PlayDate for user ${user_id} deleted.`);

    }catch (error) {
        console.error("Error deleting PlayDate:", error);
        throw error;
      }


}



  