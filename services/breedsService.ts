
import { pool } from "../config/db";
import { RowDataPacket } from "mysql2";
interface Breed {
    name: string;
    size: string;
}

export const getBreedsAndSize = async (): Promise<Breed[]> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>("SELECT  name,size FROM breeds");

        
        const breeds: Breed[] = rows.map((row) => ({
            name: row.name,
            size: row.size,
        }));

        return breeds;
    } catch (error) {
        console.error('Error fetching breeds and size:', error);
        throw new Error("Unable to fetch breeds and size");
    }
};
