
import { title } from "process";
import { pool } from "../config/db";
import { CustomRequest } from "../customes/request"
import { stat } from "fs";
import { sendBlockNotification, setChatDeletedForUser } from "./chatService";


//Function to block users that the user want to blocking for himself
//He can also delete the chat between them for himslf
export const userBlockUser = async (blockerUserId: string, blockedUserId: string, deleteChat: false) => {
  const query = `INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?,?)`;
  const [result]: any = await pool.query(query, [blockerUserId, blockedUserId]);
  if (result.affectedRows === 0) {
    throw { status: 400, title: "failed to block user", message: "user was not blocked" };
  }
  if (deleteChat) {
    await setChatDeletedForUser(blockerUserId, blockedUserId, true);
  }
  //get a message to the blocked user that he was blocked
  // await sendMessageToTheBlockedUser(blockedUserId);
  await sendBlockNotification(blockerUserId, blockedUserId, "block")

}

//Check if you are blocking specific user or he is blocked you
export const checkIfBlockerOrBlocked = async (userId: string, otherUserId: string) => {
  const query = `SELECT * FROM blocked_user WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?)`;
  const [result]: any = await pool.query(query, [userId, otherUserId, otherUserId, userId]);
  if (result.length === 0) {
    return false;
  }
  return true;
}



export const deleteBlockUser = async (blockerUserId: string, blockedUserId: string) => {
  const cleanedBlockerId = blockerUserId.trim();
  const cleanedBlockedId = blockedUserId.trim();

  const query = `DELETE FROM blocked_users WHERE blocker_id =? AND blocked_id = ?`;

  const [result]: any = await pool.query(query, [cleanedBlockerId, cleanedBlockedId]);
  console.log(result);

  if (result.affectedRows === 0)
    throw { status: 400, title: "failed to delete block user", message: "user was not deleted" };
  //get a message to the unblocked user that he was unblocked
  await sendBlockNotification(blockerUserId, blockedUserId, "unblock")

}

//The user can see all him blocked users
export const getMyBlockedService = async (userId: string) => {
  const query = `
      SELECT u.user_id, u.name, u.email
      FROM blocked_users AS ub
      JOIN users AS u ON ub.blocked_id = u.user_id
      WHERE ub.blocker_id = ?
    `;
  const [results]: any = await pool.query(query, [userId]);

  if (results.length === 0) {
    throw {
      status: 404,
      title: "No blocked users",
      message: "This user hasn't blocked anyone.",
    };
  }

  return results; 
};


