import { DataSource } from "typeorm";
import dotenv from "dotenv";

const mode =
  process.env.NODE_ENV === "test"
    ? "test"
    : process.env.NODE_ENV === "production"
    ? "production"
    : "development";

dotenv.config({ path: `.env.${mode}` });

const commonOptions = {
  type: "postgres" as const,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: mode !== "production",
};

export const AppDataSource = new DataSource({
  ...commonOptions,
  entities: [],
});
