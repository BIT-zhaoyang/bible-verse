import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

declare global {
  var __bibleVersePool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = global.__bibleVersePool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") {
  global.__bibleVersePool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
