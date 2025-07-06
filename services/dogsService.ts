import { pool } from "../config/db";

export const deleteDogsById=async(user_id:string)=>{
    try{
    const query="DELETE FROM dogs WHERE user_id=?";
    await pool.execute(query,[user_id])
    console.log(`All dogs for user ${user_id} deleted.`);

    }catch (error) {
        console.error("Error deleting dogs:", error);
        throw error;
      }


}

