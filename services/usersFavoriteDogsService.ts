import { pool } from "../config/db";
import { ResultSetHeader } from "mysql2/promise";

// Inserts a new favorite dog for the specified user
export const addFavoriteDog = async (user_id: string, dog_id: string) => {
    const [result] = await pool.query(
        "INSERT INTO users_favorite_dogs (user_id, dog_id) VALUES (?, ?)", 
        [user_id, dog_id]
    ) as ResultSetHeader[];
    
    return { user_id, dog_id, affectedRows: result.affectedRows };
}

// Removes a favorite dog for user by Id
export const removeFavoriteDog = async (user_id: string, dog_id: string) => {
const [result]=await pool.query(
           "DELETE FROM users_favorite_dogs WHERE user_id = ? AND dog_id = ?", 
 [user_id,dog_id]
)as ResultSetHeader[];
    return { user_id, dog_id, affectedRows: result.affectedRows };

};
//Checking if user & dog are exists
export const checkUserAndDogExists = async (user_id: string, dog_id: string) => {
    const dogExistsQuery = 'SELECT COUNT(*) AS countDog FROM dogs WHERE dog_id = ?';
    const userExistsQuery = 'SELECT COUNT(*) AS countUser FROM users WHERE user_id = ?';

    const [dogResult]: any = await pool.query(dogExistsQuery, [dog_id]);
    const [userResult]: any = await pool.query(userExistsQuery, [user_id]);

    return dogResult[0].countDog > 0 && userResult[0].countUser > 0;
}
