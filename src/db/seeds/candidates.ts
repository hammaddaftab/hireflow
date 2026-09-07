// Persistent database seeder for candidates entity
// Seeds baseline parsed candidate profiles into PostgreSQL via Drizzle ORM

import { db, candidates, conn } from "@/db";
import { MOCK_CANDIDATES } from "@/lib/mockCandidates";
import { candidateProfileToRow } from "@/entities/candidate";

// Seed function for candidates (must run after seedJobs due to appliedJobId FK constraint)
export async function seedCandidates() {
  console.log("Seeding candidates...");
  const rows = MOCK_CANDIDATES.map(candidateProfileToRow);
  await db.insert(candidates).values(rows);
  console.log(`Successfully seeded ${rows.length} candidate(s).`);
}

// Standalone execution support
if (process.argv[1]?.includes("seeds/candidates")) {
  seedCandidates()
    .then(() => conn.end())
    .catch((err) => {
      console.error("Failed to seed candidates:", err);
      process.exit(1);
    });
}
