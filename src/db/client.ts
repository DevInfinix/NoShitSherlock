import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    ssl: connectionString?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
