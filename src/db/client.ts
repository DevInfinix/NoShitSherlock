import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

// Ensure explicit sslmode=verify-full or libpq-compatible parameters to avoid pg deprecation warning
function getSanitizedConnectionString(url?: string): string | undefined {
  if (!url) return undefined;
  // Replace sslmode=require with sslmode=verify-full to comply with modern libpq standard
  if (url.includes("sslmode=require")) {
    return url.replace("sslmode=require", "sslmode=verify-full");
  }
  return url;
}

const sanitizedConnectionString = getSanitizedConnectionString(connectionString);

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: sanitizedConnectionString,
    ssl: connectionString?.includes("sslmode=") ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
