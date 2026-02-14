import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  // CLI scripts (seed/migrations) don't always preload .env the way Next runtime does.
  loadEnvConfig(process.cwd());
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to instantiate the database client");
}

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export const db = drizzle(dbPool);
