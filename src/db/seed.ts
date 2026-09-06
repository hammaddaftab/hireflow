// Persistent database seeder for fresh database setup
// Seeds baseline resume upload records directly into PostgreSQL via Drizzle ORM

import { db, resumeUploads, conn } from "@/db";

export const INITIAL_RESUME_UPLOADS = [
  {
    id: "upl_mock_resume_a",
    filename: "mock_resume_a.pdf",
    size: 292618,
    contentType: "application/pdf",
    blobUrl: "storage://resumes/mock_resume_a.pdf",
    pathname: "resumes/mock_resume_a.pdf",
    hash: "2dc311a21fd4bfab3102ecdccd7bd226a0ac8fc927722bc162873a49d23183b5",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-09-06T19:07:47.686Z"),
    updatedAt: new Date("2026-09-06T19:07:47.686Z"),
  },
  {
    id: "upl_mock_resume_b",
    filename: "mock_resume_b.pdf",
    size: 517151,
    contentType: "application/pdf",
    blobUrl: "storage://resumes/mock_resume_b.pdf",
    pathname: "resumes/mock_resume_b.pdf",
    hash: "ae32a851ce3e56b6c00f76798732a39eb207cc569d437de005bdbbf517ebfefa",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-09-06T19:27:47.686Z"),
    updatedAt: new Date("2026-09-06T19:27:47.686Z"),
  },
];

// Direct insert assuming a fresh database without existence checks
export async function seedResumeUploads() {
  await db.insert(resumeUploads).values(INITIAL_RESUME_UPLOADS);
}

async function run() {
  console.log("Seeding resume uploads into database...");
  await seedResumeUploads();
  console.log(`Successfully seeded ${INITIAL_RESUME_UPLOADS.length} resume uploads.`);
  await conn.end();
}

run().catch((error) => {
  console.error("Database seed failed:", error);
  process.exit(1);
});
