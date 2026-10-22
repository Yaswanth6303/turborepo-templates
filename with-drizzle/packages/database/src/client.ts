import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const createPool = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Without a listener, a dropped idle connection (database restart, network blip)
  // crashes the whole process. Queries still fail normally and can be retried.
  pool.on("error", (error) => {
    console.error("Unexpected Postgres pool error", error);
  });
  return pool;
};

// Reuse one pool across hot reloads so dev doesn't exhaust connections.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
