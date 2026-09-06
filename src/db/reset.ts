// Database reset script: drops and recreates public schema, then applies migrations and seeds

import { conn } from "@/db";
import { execSync } from "child_process";

async function reset() {
  console.log("Dropping and recreating public schema...");
  await conn.unsafe("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  await conn.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE;");
  await conn.end();

  console.log("Applying all migrations...");
  execSync("npx drizzle-kit migrate", { stdio: "inherit" });

  console.log("Seeding fresh database records...");
  execSync("npx tsx --env-file=.env src/db/seed.ts", { stdio: "inherit" });

  console.log("Fresh database state initialized successfully.");
}

reset().catch((error) => {
  console.error("Database reset failed:", error);
  process.exit(1);
});
