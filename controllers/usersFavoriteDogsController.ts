import { pool } from "../config/db";
import { NextFunction, Request, Response } from "express";
import { addFavoriteDog,removeFavoriteDog,checkUserAndDogExists } from "../services/usersFavoriteDogsService";
import { sendErrorResponse } from "../utils/errorHandlers";
import { title } from "process";


// Add favorite dog for specific user
export const addFavoriteDogForUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("addFavoriteDog function called");
    try {
        const { user_id, dog_id } = req.body;
        if (!user_id || !dog_id) {
            return res.status(400).json({
                title: "Some necessary data not provided",
                message: "Please provide user id and dog id."
            });
        }
        
        const isExists=await checkUserAndDogExists(user_id,dog_id);

        if( !isExists){
            return res.status(404).json({
                title:"NOT FOUND :",
                message:"Dog or User not found :( "
            })
        }

        await addFavoriteDog(user_id, dog_id);

        return res.status(200).json({ message: "Favorite dog added successfully 👍👍👍" });
    } 
    
    catch (error) {
        console.error('Error adding favorite dog: ', error); // לוג של השגיאה
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
}
// Remove one favorite dog for user
export const removeFavoriteDogForUser = async(req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("removeFavoriteDogForUser is called 🤗🤝");
    try {
        const { user_id, dog_id } = req.body;
        if (!user_id || !dog_id) {
            return res.status(400).json({
                title: "Some necessary data not provided",
                message: "Please provide user id and dog id."
            });
        }

        
       const isExists=await checkUserAndDogExists(user_id,dog_id);

        if( !isExists){
            return res.status(404).json({
                title: "NOT FOUND :",
                message: "Dog or User not found :( "
            });
        }

        await removeFavoriteDog(user_id, dog_id);

        return res.status(200).json({
            title: "Request completed successfully.",
            message: "Dog deleted successfully ..."
        });
    } catch (error) {
        console.error('Error removing favorite dog:', error); 
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }}