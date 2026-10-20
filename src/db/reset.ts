// Database reset script: drops and recreates public schema, applies migrations,
// and orchestrates full demo pipeline (jobs -> resume uploads -> mock candidates & groups).

import { conn } from "@/db";
import { execSync } from "child_process";

async function reset() {
  console.log("Dropping and recreating public schema...");
  await conn.unsafe("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  await conn.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE;");
  await conn.end();

  console.log("Applying all migrations...");
  execSync("npx drizzle-kit migrate", { stdio: "inherit" });

  console.log("\n[Step 1/3] Seeding job requirements...");
  execSync("npm run db:seed:jobs", { stdio: "inherit" });

  const isCleanJobsOnly = process.argv.includes("--jobs-only") || process.argv.includes("--clean");

  if (isCleanJobsOnly) {
    console.log("Clean mode requested: stopped after job requirements seed.");
    console.log("Fresh database state initialized successfully (jobs only).");
    return;
  }

  console.log("\n[Step 2/3] Compiling and uploading demo resumes in decoupled state...");
  execSync("npm run demo:setup-resumes:decouple", { stdio: "inherit" });

  console.log("\n[Step 3/3] Setting up mock candidates and group memberships...");
  execSync("npm run demo:setup-candidates", { stdio: "inherit" });

  console.log("\nFresh database with full demo pipeline initialized successfully.");
}

reset().catch((error) => {
  console.error("Database reset failed:", error);
  process.exit(1);
});
