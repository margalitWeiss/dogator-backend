import { v4 as uuidv4 } from 'uuid';
import { pool } from "../config/db";
import redis from "../utils/redisClient"; 


export const createEmailVerificationToken = async (userId: string): Promise<string> => {
  const token = uuidv4();
  const key = `verify_email:${token}`;

  await redis.set(key, userId, "EX", 60 * 60 * 24); 

  return token;
};
  
export const verifyEmailByToken = async (token: string): Promise<void> => {
    const key = `verify_email:${token}`;
    const userId = await redis.get(key);
  
    if (!userId) {
      throw new Error("Invalid or expired token");
    }
    await pool.query(`UPDATE users SET is_email_verified = true WHERE user_id = ?`, [userId]);
    await redis.del(key);
  };

