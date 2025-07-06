
import { pool } from "../config/db";
import { NextFunction, Request, Response } from "express"
import { getNearbyUsersWithDogs } from "../services/userServices";
import { sendErrorResponse } from "../utils/errorHandlers";
import { v4 as uuidv4 } from "uuid";


// export const searchDogsByLocation = async (req: Request, res: Response): Promise<void> => {
//     try {console.log("fdghgfdgfhghfg")
//         console.log(req.query)
//         const { city, district, country, neighborhood, breed, temperament, ageMin, ageMax, gender, hasPhotos } = req.query;
//         if (!city  || !country) {
//             console.log("1")
//             sendErrorResponse(res, 400, "Missing details", "Missing required parameters: country, district, city");
//             return;
//         }
//         const minAge = Number(ageMin);
//         const maxAge = Number(ageMax);

//         if (isNaN(minAge) || isNaN(maxAge)) {
//             console.log("2")
//             sendErrorResponse(res, 400, "error", "Invalid age filter provided");
//             return;

//         }
//         const genderSort = (req.query.gender as string)?.toLowerCase();

//         if (genderSort && genderSort !== "male" && genderSort !== "female") {
//             console.log("3")

//             sendErrorResponse(res, 400, "Invalid gender", "Gender must be 'male' or 'female'");
//             return;
//         }
//         console.log(`parameters: country ${country}, district ${district}, city ${city}`);


//         const nearbyUsersWithDogs = await getNearbyUsersWithDogs(
//             country as string,
//             city as string,
//             district as string,
//             neighborhood as string,
//             breed as string,
//             temperament as string,
//             minAge,
//             maxAge,
//             gender as string,
//             hasPhotos !== undefined ? hasPhotos === "true" : undefined
//         );
// console.log("gghhghg  "+nearbyUsersWithDogs)
// console.log("4")

//         res.json({ nearbyUsers: nearbyUsersWithDogs });

//     } catch (error) {
//         console.error("Error searching dogs by location:", error);
//         console.log("5")

//         sendErrorResponse(res, 500, "Error in search Dogs By Location", "Internal server error");
//     }
// };



export const searchDogsByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("fdghgfdgfhghfg")
        console.log(req.query)
        const { city, district, country, neighborhood, breed, temperament, ageMin, ageMax, gender, hasPhotos } = req.query;
        
        if (!city || !country) {
            console.log("1")
            sendErrorResponse(res, 400, "Missing details", "Missing required parameters: country, city");
            return;
        }

        // בדיקת גיל רק אם הפרמטרים נשלחו
        let minAge: number | undefined;
        let maxAge: number | undefined;

        if (ageMin !== undefined) {
            minAge = Number(ageMin);
            if (isNaN(minAge)) {
                console.log("2")
                sendErrorResponse(res, 400, "error", "Invalid ageMin filter provided");
                return;
            }
        }

        if (ageMax !== undefined) {
            maxAge = Number(ageMax);
            if (isNaN(maxAge)) {
                console.log("2")
                sendErrorResponse(res, 400, "error", "Invalid ageMax filter provided");
                return;
            }
        }

        const genderSort = (req.query.gender as string)?.toLowerCase();

        if (genderSort && genderSort !== "male" && genderSort !== "female") {
            console.log("3")
            sendErrorResponse(res, 400, "Invalid gender", "Gender must be 'male' or 'female'");
            return;
        }
        
        console.log(`parameters: country ${country}, district ${district}, city ${city}`);

        const nearbyUsersWithDogs = await getNearbyUsersWithDogs(
            country as string,
            city as string,
            district as string,
            neighborhood as string,
            breed as string,
            temperament as string,
            minAge,
            maxAge,
            gender as string,
            hasPhotos !== undefined ? hasPhotos === "true" : undefined
        );
        
        console.log("gghhghg  " + nearbyUsersWithDogs)
        console.log("4")

        res.json({ nearbyUsers: nearbyUsersWithDogs });

    } catch (error) {
        console.error("Error searching dogs by location:", error);
        console.log("5")
        sendErrorResponse(res, 500, "Error in search Dogs By Location", "Internal server error");
    }
};



// //  החזרת כלבים קרובים לפי רדיוס וקואורדינטות
// export const getNearbyDogs = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//     try {
//         const { lat, lon, radius = 10 } = req.query;

//         if (!lat || !lon) {
//             return res.status(400).json({ title: "missing location", message: "Latitude and longitude are required." });
//         }

//         const sql = `
//             SELECT d.*,
//                 (6371 * acos( cos( radians(?) ) * cos( radians(u.latitude) ) 
//                 * cos( radians(u.longitude) - radians(?) ) + sin( radians(?) ) 
//                 * sin( radians(u.latitude) ) ) ) AS distance 
//             FROM dogs d
//             JOIN users u ON d.user_id = u.id
//             HAVING distance < ?
//             ORDER BY distance;
//         `;

//         const [dogs]: any = await db.query(sql, [lat, lon, lat, radius]);
//         res.json(dogs);
//     } catch (err: any) {
//         console.error("error retrieving nearby dogs:", err.message);
//         res.status(500).json({ title: "server error", message: "something went wrong. Please try again later." });
//     }
// };


//חיפוש כלבים קרובים לפי עיר/איזור/מדינה
import { CustomRequest } from '../customes/request';
export const getNearbyDogs = async (req: CustomRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("searching dog by address 🤗")
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    try {
        const user_id = req.id;
        const { country, region, city } = req.query;

        if (!country && !region && !city) {
            return res.status(400).json({ title: "missing filters", message: "You must provide at least one of: country, city, or region." });
        }
        const conditions: string[] = [];
        const values: any[] = [];

        if (country) {
            conditions.push("u.country = ?");
            values.push(country);
        }

        if (region) {
            conditions.push("u.region = ?");
            values.push(region);
        }

        if (city) {
            conditions.push("u.city = ?");
            values.push(city);
        }

        // שליפת הכלבים הקרובים
        const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
        const sql = `
              SELECT d.*
              FROM dogs d
              JOIN users u ON d.user_id = u.id
              ${whereClause}
              ORDER BY d.user_id
              LIMIT ? OFFSET ?
         `;


        // const [dogs]: any = await pool.query(sql, values);
        const valuesWithPagination = [...values, limit, offset];

        const [nearbyDogs]: any = await pool.query(sql, valuesWithPagination);

        //שליפת הגזע והגודל של הכלב/ים של המשתמש
        const [userDogs]: any = await pool.query(
            `select breed,weight from dogs where user_id = ?`, [user_id]);

        // החזרת שגיאה אם אין כלבים
        if (userDogs.length == 0) {
            return res.status(404).json({ title: "not found", messege: "no dogs found for this user." })
        }

        //חילוץ הגזעים והמשקלים של הכלב/ים של המשתמש
        const userBreed = new Set(userDogs.map((dog: any) => dog.breed));
        const userWeight = new Set(userDogs.map((dog: any) => dog.weight));

        //חילוץ הגזעים והמשקלים של הכלבים הקרובים לפי הכלבים של המשתמש
        const dogsByBreed = nearbyDogs.filter((d: any) => userBreed.has(d.breed));
        const dogsByWeight = nearbyDogs.filter((d: any) => userWeight.has(d.weight));


        return res.json({
            byBreed:
                dogsByBreed.length > 0
                    ? { result: dogsByBreed }
                    : { messege: "no dogs found whose breed matches your dog." },
            byWeight:
                dogsByWeight.length > 0
                    ? { result: dogsByWeight }
                    : { messege: "no dogs found whose weight matches your dog." },
            nearby: nearbyDogs
        })

    } catch (err: any) {
        console.error("error retrieving dogs by location:", err.message);
        res.status(500).json({ title: "server error", message: "Something went wrong. Please try again later." });
    }
};

//         //שליפת הגזע של הכלב של המשתמש
//         const [userBreedResult]: any = await db.query(
//             `   SELECT d.breed 
//             FROM dogs d
//             JOIN users u ON d.user_id = u.id
//             WHERE u.id = ?
//            `, [user_id]);
//         if (userBreedResult.length === 0) {
//             return res.status(404).json({ title: "not found", message: "No dog found for this user." });
//         }
//         const userBreed = userBreedResult.map((dog: any) => dog.breed);
//         //שליפת כל הכלבים שהגזע שלהם תואם לגזע של הכלב/ים של המשתמש
//         const dogsByBreed = nearbyDogs.filter((dog: any) => userBreed.includes(dog.breed));
//         // שליפה של משקל הכלב/ים של המשתמש
//         const [userWeightResult]: any = await db.query(
//             `   SELECT d.weight 
//             FROM dogs d
//             JOIN users u ON d.user_id = u.id
//             WHERE u.id = ?
//           `, [user_id]);
//         if (userWeightResult.length === 0) {
//             return res.status(404).json({ title: "not found", message: "No dog found for this user." });
//         }
//         const userWeight = userWeightResult.map((dog: any) => dog.weight);
//         //שליפת כל הכלבים שהמשקל שלהם תואם למשקל של הכלב/ים של המשתמש
//         const dogsByWeight = nearbyDogs.filter((dog: any) => userWeight.includes(dog.weight));
//         // console.log("sql:" +sql,values)
//         return res.json({
//             // userBreed,
//             byBreed: dogsByBreed,
//             byWeight: dogsByWeight,
//             nearby: nearbyDogs
//         });
//     } catch (err: any) {
//         console.error("error retrieving dogs by location:", err.message);
//         res.status(500).json({ title: "server error", message: "Something went wrong. Please try again later." });
//     }
// };


// //הוספת כלב חדש
// export const addDog = async (req: CustomRequest, res: Response, next: NextFunction): Promise<Response | void> => {
//     console.log("addDog function called 😫")
//     console.log(req.body);
//     try {
//         // const dog_id = uuidv4();
//         const user_id =  req.userAuth?.userId;
//         console.log(user_id)
//         const { name, breed, age, gender, temperament, bio, photos} = req.body;
//         const temperamentJSON = JSON.stringify(temperament);
//         const photosJSON = JSON.stringify(photos);

//         if (!name || !age ) {
//             return res.status(400).json({
//                 title: "missing data",
//                 message: "please provide name and  age and user id."
//             })
//         }
//         const sql = `INSERT INTO dogs ( user_id, name, breed, age, gender,  temperament, bio, photos) 
//                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//         const [result]: any = await pool.query(sql, [user_id, name, breed, age, gender, temperamentJSON, bio, photosJSON]);

//         const [rows]: any = await pool.query(`SELECT dog_id FROM dogs WHERE user_id = ? AND name = ? ORDER BY created_at DESC LIMIT 1`, [user_id, name]);

//         const dog_id = rows[0]?.dog_id;
//         const createdAt = rows[0]?.created_at;

//         res.status(201).json({ dog_id, user_id, name, breed, age, gender, temperament, bio, photos, createdAt });
//     } catch (err: any) {
//         console.error("error adding dog:", err.message);
//         res.status(500).json({
//             title: "server error",
//             message: "something went wrong. please try again later."
//         })
//     }
// }


export const addDog = async (req: CustomRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("addDog function called 🐶");
    console.log(req.body);

    try {
        const dog_id = uuidv4();
        const user_id = req.userAuth?.userId;
        console.log("user_id:", user_id);

        const { name, breed, age, gender, temperament, bio, photos } = req.body;
        const temperamentJSON = JSON.stringify(temperament);
        const photosJSON = JSON.stringify(photos);

        if (!name || !age || !user_id) {
            return res.status(400).json({
                title: "Missing data",
                message: "Please provide name, age, and user id."
            });
        }

        const sql = `
            INSERT INTO dogs (dog_id, user_id, name, breed, age, gender, temperament, bio, photos)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [dog_id, user_id, name, breed, age, gender, temperamentJSON, bio, photosJSON]);

        const [rows]: any = await pool.query(`SELECT created_at FROM dogs WHERE dog_id = ?`, [dog_id]);
        const createdAt = rows[0]?.created_at;

        res.status(201).json({ dog_id, user_id, name, breed, age, gender, temperament, bio, photos, createdAt });
    } catch (err: any) {
        console.error("Error adding dog:", err.message);
        res.status(500).json({
            title: "Server error",
            message: "Something went wrong. Please try again later."
        });
    }
};

//החזרת כלב לפי ID
export const getDogByID = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("getDogById function called ❤️")
    try {
        const { id } = req.params;

        const sql = "SELECT * FROM dogs WHERE dog_id = ?";
        const [dogs]: any = await pool.query(sql, [id]);

        if (dogs.length == 0) {
            return res.status(404).json({ title: "not found", message: "no dog  with such id" });
        }

        res.json(dogs[0]);
    } catch (err: any) {
        console.error("error fetching dog by id:", err.message);
        res.status(500).json({ title: "server error", message: "something went wrong. please try again later." });
    }
}

//עדכון פרטי כלב לפי ID
export const updateDogByID = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("update function lalalala 🙈")
    try {
        const { id } = req.params;
        const data = req.body;

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                title: "no data provided",
                message: "please provide at least one field to update."
            })
        }

        const fields = Object.keys(data).map(key => `${key} = ?`).join(", ");
        const values = Object.values(data);

        const sql = `UPDATE dogs SET ${fields} WHERE dog_id = ?`;
        const [result]: any = await pool.query(sql, [...values, id]);

        if (result.affectedRows == 0) {
            return res.status(404).json({
                title: " dog not found",
                message: "no dog  with such id"
            })
        }

        return res.json({ id, ...data });

    } catch (err: any) {
        console.error("can't update dog", err.message);
        return res.status(500).json({
            title: "server error",
            message: "something went wrong. please try again later."
        })
    }
}


//  IDעדכון מיקומי התמונות של הכלב לפי 

export const updatePicturePlace = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { id } = req.params;
        const { newPhotosList } = req.body;

        if (!id || !newPhotosList) {
            return res.status(400).json({
                title: "Required details were not provided"
            });
        }

        const sql = `UPDATE dogs SET photos = ? WHERE dog_id = ?`;
        const [result]: any = await pool.query(sql, [JSON.stringify(newPhotosList), id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                title: "Dog not found",
                message: "No dog with such id"
            });
        }

        return res.json({ id, newPhotosList });

    } catch (err: any) {
        console.error("Can't update photos order for dog", err.message);
        return res.status(500).json({
            title: "Server error",
            message: "Something went wrong. Please try again later."
        });
    }
}


//מחיקת כלב לפי ID
export const deleteDogById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log("delete function lalalala")
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ title: "missing ID", message: "dog id is required." });
    }

    try {
        const [result]: any = await pool.query("DELETE FROM dogs WHERE dog_id = ?", [id]);

        if (result.affectedRows == 0) {
            return res.status(404).json({ title: "not found", message: "no dog with such id" });
        }

        res.json({ title: "success", message: `the dog with the id  ${id} deleted successfully.` });

    } catch (error) {
        console.error("error deleting dog:", error);
        res.status(500).json({ title: "server Error", message: "something went wrong, please try again later." });
    }
};


