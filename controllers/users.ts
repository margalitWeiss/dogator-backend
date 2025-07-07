
import { Request, Response } from "express";
import generateToken from "../utils/generateToken";
import bcrypt from "bcrypt";
import { sendErrorResponse } from "../utils/errorHandlers";
import { pool } from "../config/db";
import { CustomRequest } from "../customes/request";
import { validate as isUUID } from "uuid"; 
import { getUserByEmail, updateFcmToken, updateLastActive ,createUser, deleteUserByID} from "../services/userServices";
import { isValidEmail, isValidPassword } from "../utils/authValidator";
import { createEmailVerificationToken } from "../services/emailVerificationService";
import { sendVerificationEmail } from "../utils/emailSender";
import { deleteDogsById } from "../services/dogsService";
import { deleteMessagesById } from "../services/messagesService";
import { deleteReportsById } from "../services/reportsService";
import { deletePlayDatesById } from "../services/playDateServices";
import jwt from "jsonwebtoken";
import redis from "../utils/redisClient"; 






export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password,Fcm_token } = req.body;

    if (!email || !password) {
         sendErrorResponse(res, 400, "Missing details", "Missing email or password");
         return;

    }
    if (!isValidEmail(email)) {
        sendErrorResponse(res, 400, "Invalid input", "Invalid email format");
        return;
    }
    try {
        const user = await getUserByEmail(email);
        if (!user) {
             sendErrorResponse(res, 401 , "Cannot login", "No user with such details");
             return;
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            sendErrorResponse(res, 401, "Cannot login", "No user with such details");
             return;
        }
       await updateLastActive(email);
        const token = generateToken({ user_id: user.user_id, email, role: user.role });
        if(Fcm_token&&user.Fcm_token!=Fcm_token){
            await updateFcmToken(user.user_id,Fcm_token);
        }
        const userId=user.user_id;
        res.json({ message: "User registered successfully", token, userId,role:user.role });
    } catch (err: any) {
        sendErrorResponse(res, 500, "Error", err.message);
    }
};





 export const signUp = async (req: Request, res: Response):Promise<void> => {
    try {
        const { email, password,Fcm_token,role='user' } = req.body;
        const normalizedRole = role?.toLowerCase();
console.log("signUp called with role: ", normalizedRole);
        
        if (!email || !password) {
            sendErrorResponse(res, 400, "Cannot signup", "Missing email , password or Fcm_token");
             return;
        }
        if (!['admin', 'user', 'editor'].includes(normalizedRole)) {
            sendErrorResponse(res, 400, "Cannot signup", "Invalid role");
            return;
          }          
        if (!isValidEmail(email)) {
            sendErrorResponse(res, 400, "Cannot signup", "Invalid email format");
            return;
        }
        if (!isValidPassword(password)) {
            sendErrorResponse(res, 400, "Cannot signup", "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."
);
            return;
        }
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            sendErrorResponse(res, 400, "Cannot signup","Email already in use");
              return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const { userId } = await createUser(email, hashedPassword,Fcm_token,normalizedRole);

        const token = generateToken({ user_id: userId, email, role: normalizedRole });

        const verificationToken = await createEmailVerificationToken(userId);

        await sendVerificationEmail(email, verificationToken);

          res.json({ message: "User registered successfully", token, userId,role });
    } catch (error) {
        console.error("Signup error:", error);
        sendErrorResponse(res, 500, "Cannot signup", "Internal server error");
    }
};




export const deleteUser = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userAuth?.userId;

        if (!userId) {
            sendErrorResponse(res, 400, "ERROR", "Missing userId");
            return;
        }

        await deleteDogsById(userId);
        await deleteReportsById(userId);
        await deleteMessagesById(userId);
        await deletePlayDatesById(userId);
        await deleteUserByID(userId);

        res.status(200).json({ message: "User and related data deleted successfully" });

    } catch (error) {
        console.error("Error deleting user:", error);
        sendErrorResponse(res, 500, "ERROR", "Failed to delete user");
    }
};




export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendErrorResponse(res, 401, "ERROR", "No token provided");
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      sendErrorResponse(res, 400, "ERROR", "Invalid token");
      return;
    }

    const expiresAt = decoded.exp * 1000;
    const ttlSeconds = Math.floor((expiresAt - Date.now()) / 1000); 

    if (ttlSeconds > 0) {
      await redis.set(`blacklist:${token}`, "1", "EX", ttlSeconds);
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    sendErrorResponse(res, 500, "ERROR", "Server error");
  }
};



export const getUserById = async (req: CustomRequest, res: Response): Promise<void> => {

    try {
        const id =  req.userAuth?.userId||req.params.id;
        console.log(id)
        const [rows]: any = await pool.query("SELECT * FROM users WHERE user_id = ?", [id]);

        if (rows.length == 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { password, ...userDetails } = rows[0]

        res.json(rows[0]); // return the user details without password
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: (err as Error).message });
    }
};




export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("updateUser")
        const id = req.params.id;
        const fieldsForUpdate = Object.entries(req.body)
            .filter(([_key, value]) => value !== undefined); // filter out undifined values
        if (fieldsForUpdate.length === 0) {
            res.status(400).json({ message: "No valid fields provided for update" });
            return;
        }
        const fieldsSql = fieldsForUpdate.map(([key]) => `${key} = ?`).join(", ");
        const values = fieldsForUpdate.map(([_key, value]) => value);

        const sql = `UPDATE users SET ${fieldsSql} WHERE user_id = ?`;
        const [result]: any = await pool.query(sql, [...values, id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({ message: "User updated successfully" });

    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: (err as Error).message });
    }
};




export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        if (!id || !isUUID(id)) {
            res.status(400).json({ message: "Invalid user ID format" });
            return;
        }

        // delete user by id
        const [rows]: any = await pool.query("DELETE FROM users WHERE user_id = ?", [id]);

        if (rows.affectedRows === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({ message: "user deleted succsesfully" });


    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: (err as Error).message });
    }
};