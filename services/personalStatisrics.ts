import { pool } from "../config/db"
import { database } from '../config/firebase';


export const cntPlaydatesInvited = async (user_id: string) => {
    try {
        const query = `SELECT COUNT(*) AS count FROM playdates WHERE participant_user_id = ?`
        const [rows]: any = await pool.query(query, [user_id])
        return rows[0].count;
    }
     catch (err: any) {
        console.error("cntPlaydatesInvited functiion faild:", err.message);
        throw new Error("Failed to count playdates for user.");
    } 
    
}


export const cntConfirmedPlaydates = async (user_id: string) => {
    try {
        const query = `
                    SELECT COUNT(*) AS count FROM playdates 
                    WHERE (host_user_id =?
                    OR participant_user_id =?)
                    AND status="confirmed"`
        const [rows]: any = await pool.query(query, [user_id,user_id])
        return rows[0].count;
    }
     catch (err: any) {
        console.error("cntConfirmedPlaydates functiion faild:", err.message);
        throw new Error("Failed to count reports for user.");
    } 
    
}

export const cntDogsInProfile = async (user_id: string) => {
    try {
        const query = `  SELECT COUNT(*) AS count FROM dogs WHERE user_id =?`

        const [rows]: any =await pool.query(query, [user_id])
        return rows[0].count;
    }
     catch (err: any) {
        console.error("cntDogsInProfile functiion faild:", err.message);
        throw new Error("Failed to count reports for user.");
    } 
    
}
//!!!!תזכורת!!!!!!!!!!!
//טעון שיפור
export const countAllMessagesForUser = async (userId: string): Promise<number> => {
  const chatsRef = database.ref('chats');
  const snapshot = await chatsRef.once('value');
  const chats = snapshot.val();

  if (!chats) return 0;

  let totalCount = 0;

  for (const chatId in chats) {
    if (!chatId.includes(userId)) continue;

    const messages = chats[chatId]?.messages;
    if (messages) {
      totalCount += Object.keys(messages).length;
    }
  }

  return totalCount;
};
