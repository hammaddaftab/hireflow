// Persistent database seeder for resume uploads entity
// Seeds baseline resume upload records into PostgreSQL via Drizzle ORM

import { db, resumeUploads, conn } from "@/db";

export const INITIAL_RESUME_UPLOADS = [
  {
    id: "upl_tariq_mehmood",
    filename: "tariq_mehmood_resume.pdf",
    size: 18980,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714146296-tariq_mehmood_resume.pdf",
    pathname: "resumes/1791714146296-tariq_mehmood_resume.pdf",
    hash: "c20936c26ce933282b6181d5d974a5de631cff67f40198cdcf3c6b273c717f06",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T10:00:00.000Z"),
    updatedAt: new Date("2026-10-11T10:00:00.000Z"),
  },
  {
    id: "upl_hamza_naveed",
    filename: "hamza_naveed_resume.pdf",
    size: 16500,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714170242-hamza_naveed_resume.pdf",
    pathname: "resumes/1791714170242-hamza_naveed_resume.pdf",
    hash: "5b54f55e6355ef1ff26cf18703b5ec7d1ee22e4ac28cbe00ec05aed9bd35d43d",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:55:00.000Z"),
    updatedAt: new Date("2026-10-11T09:55:00.000Z"),
  },
  {
    id: "upl_saad_rafiq",
    filename: "saad_rafiq_resume.pdf",
    size: 17381,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714175546-saad_rafiq_resume.pdf",
    pathname: "resumes/1791714175546-saad_rafiq_resume.pdf",
    hash: "1c2747307fdbec2dda88f4ce9922325a174a5e623455f8bd5e6f0be5c1ba5f2b",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:50:00.000Z"),
    updatedAt: new Date("2026-10-11T09:50:00.000Z"),
  },
  {
    id: "upl_bilal_ahmed",
    filename: "bilal_ahmed_resume.pdf",
    size: 18586,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714179432-bilal_ahmed_resume.pdf",
    pathname: "resumes/1791714179432-bilal_ahmed_resume.pdf",
    hash: "c0defb612a29e504a790d76e345d256ec966c87346b5b02503a25e88bc357292",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:45:00.000Z"),
    updatedAt: new Date("2026-10-11T09:45:00.000Z"),
  },
  {
    id: "upl_usman_ali",
    filename: "usman_ali_resume.pdf",
    size: 18630,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714182999-usman_ali_resume.pdf",
    pathname: "resumes/1791714182999-usman_ali_resume.pdf",
    hash: "3b3146abfea35a65b43d52bdc35e30d6b995637a9248789e7188b1c6a53ef25a",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:40:00.000Z"),
    updatedAt: new Date("2026-10-11T09:40:00.000Z"),
  },
  {
    id: "upl_ayesha_malik",
    filename: "ayesha_malik_resume.pdf",
    size: 16660,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714186621-ayesha_malik_resume.pdf",
    pathname: "resumes/1791714186621-ayesha_malik_resume.pdf",
    hash: "a8f8063e282c26ed870ec1bf0c0e6808d29521044ea7f45e6e9698e26547df6a",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:35:00.000Z"),
    updatedAt: new Date("2026-10-11T09:35:00.000Z"),
  },
  {
    id: "upl_farhan_siddiqui",
    filename: "farhan_siddiqui_resume.pdf",
    size: 18782,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714190704-farhan_siddiqui_resume.pdf",
    pathname: "resumes/1791714190704-farhan_siddiqui_resume.pdf",
    hash: "31559485a2008dbbad74ddf533c2e01934c278fd6a538460321b195b225387c9",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:30:00.000Z"),
    updatedAt: new Date("2026-10-11T09:30:00.000Z"),
  },
  {
    id: "upl_omer_farooq",
    filename: "omer_farooq_resume.pdf",
    size: 18373,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714194530-omer_farooq_resume.pdf",
    pathname: "resumes/1791714194530-omer_farooq_resume.pdf",
    hash: "49109eabbc06541c894acf1d041fc2e9893a95b5edf86cede10b2b3eeb4861be",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:25:00.000Z"),
    updatedAt: new Date("2026-10-11T09:25:00.000Z"),
  },
  {
    id: "upl_zainab_bibi",
    filename: "zainab_bibi_resume.pdf",
    size: 18480,
    contentType: "application/pdf",
    blobUrl: "https://wms5lppwujk51kvy.public.blob.vercel-storage.com/resumes/1791714199451-zainab_bibi_resume.pdf",
    pathname: "resumes/1791714199451-zainab_bibi_resume.pdf",
    hash: "86ddc25d584108422b6f71c548babe3b1665373043e7a4719f177108aa655cd1",
    jobId: "job-sample-1",
    candidateId: null,
    status: "stored",
    errorMessage: null,
    createdAt: new Date("2026-10-11T09:20:00.000Z"),
    updatedAt: new Date("2026-10-11T09:20:00.000Z"),
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
