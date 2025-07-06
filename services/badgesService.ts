import { error } from "console"
import { pool } from "../config/db"
import { json } from "stream/consumers";


//a function to check if the color that the user chose to the badge is ok
export const isValidHexColor = (color: string): boolean => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
};



// service add badge
export const addBadge = async (name: string, color: string): Promise<void> => {
    try {
        const query = `INSERT INTO badges (name, color) VALUES (?, ?)`;
        const [result]: any = await pool.query(query, [name, color]);

        if (result.affectedRows !== 1) {
            throw new Error('Failed to insert badge');
        }

        console.log('Badge inserted successfully');
    } catch (error) {
        console.error('Error inserting badge:', error);
        throw error; 
    }
};


//update color badge or badge name
export const updateBadge = async (
    id: string,
    updates: { name?: string; color?: string }
): Promise<void> => {
    try {
        const fields: string[] = [];
        const values: any[] = [];
        //check which feilds to change
        if (updates.name) {
            fields.push('name = ?');
            values.push(updates.name);
        }

        if (updates.color) {
            fields.push('color = ?');
            values.push(updates.color);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `UPDATE badges SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id); 

        const [result]: any = await pool.query(query, values);

        if (result.affectedRows !== 1) {
            throw new Error('Badge not found or not updated');
        }

        console.log('Badge updated successfully');
    } catch (error) {
        console.error('Error updating badge:', error);
        throw error;
    }
};


//get all badges
export const getBadges = async () => {
    try {
        const query = `SELECT * FROM badges`;
        const [result]: any = await pool.query(query);

        if (result.length === 0)
            throw new Error('No fields to get');
        return result;
    } catch (error) {
        console.error('Error fetch badges:', error);
        throw error;
    }
};

//match a badge for a user
export const addBadgeForUser = async (user_id: string, badge_id: string) => {
    try {
        const query = `INSERT INTO user_badges (user_id, badge_id) VALUES(?,?)`;
        const [result]: any = await pool.query(query, [user_id, badge_id]);

        if (result.affectedRows === 0)
            throw new Error('No fields to get');
        console.log('Badge inserted successfully for this user');
    } catch (error) {
        console.error('Error add badges for user:', error);
        throw error; 
    }
};

//The user can see him badges.
export const getUserBadges = async (userId: string) => {
    try {
        const query = ` SELECT b.*, ub.assigned_at 
                   FROM badges b 
                   JOIN user_badges ub ON ub.badge_id = b.id 
                   WHERE ub.user_id = ?`
        const [rows] = await pool.query(query, [userId])
        console.table(rows); // מציג טבלה יפה בקונסול
        return rows;
    } catch (error) {
        console.error('Error get badges for user:', error);
        throw error; 
    }
}

//delete a badge
export const deleteBadge = async (badgeId: string): Promise<void> => {
    try {
        const query1 = 'DELETE FROM user_badges where badge_id =?'
        await pool.query(query1, [badgeId])
        const query = `DELETE FROM badges WHERE id = ?`;
        const [result]: any = await pool.query(query, [badgeId]);
        if (result.affectedRows === 0) {
            throw new Error('Badge not found or not deleted');
        }
        console.log('Badge deleted successfully');
    } catch (error) {
        console.error('Error deleting badge:', error);
        throw error; 
    }
}


