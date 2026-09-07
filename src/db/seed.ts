// Master database seeder
// Orchestrates concept seeders in foreign-key-safe dependency order:
// 1. Jobs (root entity, required by candidates and resume uploads)
// 2. Candidates (references jobs via applied_job_id)
// 3. Resume uploads (references jobs via job_id)

import { conn } from "@/db";
import { seedJobs } from "./seeds/jobs";
import { seedCandidates } from "./seeds/candidates";
import { seedResumeUploads } from "./seeds/resumes";
import { seedGroups } from "./seeds/groups";

export async function seedAll() {
  console.log("Starting full database seed in dependency order...");
  // Step 1: Jobs must be seeded first due to foreign key constraints
  await seedJobs();
  // Step 2: Candidates reference jobs via applied_job_id
  await seedCandidates();
  // Step 3: Resume uploads reference jobs and candidates
  await seedResumeUploads();
  // Step 4: Groups and candidate memberships reference jobs and candidates
  await seedGroups();
  console.log("Full database seed completed successfully.");
}

// Standalone execution support
if (process.argv[1]?.includes("seed.ts") || process.argv[1]?.endsWith("seed")) {
  seedAll()
    .then(() => conn.end())
    .catch((err) => {
      console.error("Database seed failed:", err);
      process.exit(1);
    });
}
