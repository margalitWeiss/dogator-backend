import { NextFunction, Request, Response } from 'express';
import { pool } from '../config/db';
import { title } from 'process';
import { messaging } from 'firebase-admin';

// ניהול הגזעים



// הוספת גזע
export const createBreed = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("create breed function called 🐕");
    const { name, size } = req.body;
    if (!name || !size) {
        return res.status(400).json({
            title: "missing data",
            message: " please provide name and size breed."
        });
    }
    try {
        const sql = `INSERT INTO breeds (name,size)VALUES(?,?)`;
        const values = [name, size];
        const [result]: any = await pool.query(sql, values);
        const breed_id = result.insertId;
        return res.status(200).json({
            title: "succes",
            message: "breed created successfully",
            id: breed_id,
            name: name,
            size: size
        });
    }
    catch (err: any) {
        console.error("can't add breed", err.message);
        return res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}

//עדכון
export const updateBreed = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("update breed function called 🐶")
    try {
        const { id } = req.params;
        const data = req.body;

        if (Object.keys(data).length == 0) {
            return res.status(400).json({
                title: "no data provided",
                message: "please provide at least one field to update."
            })
        }

        const fields = Object.keys(data).map(key => `${key} = ?`).join(", ");
        const values = Object.values(data);

        const sql = `UPDATE breeds SET ${fields} WHERE breed_id = ?`;
        const [result]: any = await pool.query(sql, [...values, id]);

        if (result.affectedRows == 0) {
            return res.status(404).json({
                title: " breed not found",
                message: "no breed  with such id"
            })
        }

        return res.json({ id, ...data });

    } catch (err: any) {
        console.error("can't update breed", err.message);
        return res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}

// מחיקת גזע
export const deleteBreedById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("delete breed function 🦮")
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ title: "missing id", message: "breed id is required." });
    }

    try {
        const [result]: any = await pool.query("DELETE FROM breeds WHERE breed_id = ?", [id]);

        if (result.affectedRows == 0) {
            return res.status(404).json({ title: "not found", message: "no breed with such id" });
        }

        res.json({ title: "success", message: `the breed:  ${id} deleted successfully.` });

    } catch (error) {
        console.error("error deleting breed:", error);
        res.status(500).json({ title: "server error", message: "something went wrong, please try again later." });
    }
};

//ניהול המשתמשים

// שינוי התפקיד של המשתמש

export const UserAuthority = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("change user role  function called 🤪")
    try {
        const user_id = req.params.id;
        const { role } = req.body;
        const allowedRoles = ["USER", "ADMIN", "EDITOR"];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


        if (!user_id || !uuidRegex.test(user_id)) {
            return res.status(400).json({
                title: "invalid user id",
                message: "please provide a valid UUID."
            });
        }


        if (!role) {
            return res.status(400).json({
                title: "missing role",
                message: "please provide role to update."
            })
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                title: "invalid role",
                message: `role must be one of: ${allowedRoles.join(", ")}.`
            });
        }

        const sql = `UPDATE users SET role= ? WHERE user_id = ?`;
        const [result]: any = await pool.query(sql, [role, user_id]);

        if (result.affectedRows == 0) {
            return res.status(404).json({
                title: " user not found",
                message: "no user with such id"
            })
        }

        return res.status(200).json({
            message: "user role updated",
            data: {
                user_id,
                role
            }
        });

    } catch (err: any) {
        console.error("can't update user role", err.message);
        return res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}

//החזרת כל המשתמשים עם דפדוף

export const getUserByPagination = async (req: Request, res: Response) => {
    console.log("getUserByPagination function called 🧑‍💻")

    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                title: "invalid pagination",
                message: "page and limit must be positive integers."
            });
        }


        const [countResult] = await pool.query('SELECT  COUNT(*) AS total FROM users');
        const totalUsers = (countResult as any)[0].total;
        const totalPages = Math.ceil(totalUsers / limit);

        const [users] = await pool.query
            (' SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [limit, skip]
            );

        res.status(200).json({
            current_page: page,
            total_pages: totalPages,
            total_users: totalUsers,
            users: users
        });
    }
    catch (error) {
        console.error("error fetching users:", error);
        return res.status(500).json({
            title: "server error",
            message: "something went wrong, please try again later."
        });
    }
};

