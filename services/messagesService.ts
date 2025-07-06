import { pool } from "../config/db";

export const deleteMessagesById=async(user_id:string)=>{
    try{
    const query="DELETE FROM messages WHERE sender_id =? OR receiver_id =?";
    await pool.execute(query,[user_id,user_id])
    console.log(`All messages for user ${user_id} deleted.`);

    }catch (error) {
        console.error("Error deleting messages:", error);
        throw error;
      }


}