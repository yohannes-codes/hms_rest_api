import { Pool } from "pg";
import dotenv from "dotenv";

/* istanbul ignore next */
const mode =
  process.env.NODE_ENV === "test"
    ? "test"
    : process.env.NODE_ENV === "production"
    ? "production"
    : "development";

dotenv.config({ path: `.env.${mode}` });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export const dbClient = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};

/* istanbul ignore next */
export const closeDbConnection = async () => await pool.end();
