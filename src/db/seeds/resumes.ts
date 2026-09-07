// Persistent database seeder for resume uploads entity
// Seeds baseline resume upload records into PostgreSQL via Drizzle ORM

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
  console.log("Seeding resume uploads...");
  await db.insert(resumeUploads).values(INITIAL_RESUME_UPLOADS);
  console.log(`Successfully seeded ${INITIAL_RESUME_UPLOADS.length} resume upload(s).`);
}

// Standalone execution support
if (process.argv[1]?.includes("seeds/resumes")) {
  seedResumeUploads()
    .then(() => conn.end())
    .catch((err) => {
      console.error("Failed to seed resume uploads:", err);
      process.exit(1);
    });
}
