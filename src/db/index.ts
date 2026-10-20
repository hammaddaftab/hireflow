import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:12345678@localhost:5432/agentra";

// Global singleton for postgres connection pool across Next.js hot reloads
const globalForDb = globalThis as unknown as {
  conn?: postgres.Sql;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

export const conn =
  globalForDb.conn ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    idle_timeout: 0,
    connect_timeout: 0, // 0 disables connect timeout (infinite)
    onnotice: () => {}, // Suppress notice logs
  });

export const db =
  globalForDb.db ??
  drizzle(conn, {
    schema,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
  globalForDb.db = db;
}

export * from "./schema";
