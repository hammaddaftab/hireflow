// Persistent database seeder for jobs entity
// Defines baseline job requirements and criteria

import { db, jobs, conn } from "@/db";
import type { Job } from "@/entities/job";
import { normalizeSkill } from "@/features/extraction/skillNormalizer";
import { normalizeFieldOfStudy } from "@/features/extraction/fieldOfStudyNormalizer";

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-sample-1",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "San Francisco, CA (Remote)",
    employmentType: "full-time",
    description: null,
    seniority_level: null,
    skills_required: [
      { active: true, skill: normalizeSkill("TypeScript"), blocking: true },
      { active: true, skill: normalizeSkill("React"), blocking: true },
      { active: true, skill: normalizeSkill("Node.js"), blocking: true },
    ],
    skills_preferred: [
      { active: true, skill: normalizeSkill("Next.js"), blocking: false },
      { active: true, skill: normalizeSkill("Tailwind CSS"), blocking: false },
      { active: true, skill: normalizeSkill("PostgreSQL"), blocking: false },
    ],
    min_experience: {
      active: true,
      years: 5,
      blocking: true,
    },
    education_min: {
      active: true,
      degree_level: "bachelors",
      field: normalizeFieldOfStudy("Computer Science"),
      blocking: true,
    },
    location_requirement: {
      active: true,
      city: "San Francisco",
      province: "CA",
      blocking: false,
    },
    work_mode: {
      active: true,
      mode: "remote",
      blocking: true,
    },
    compensation_band: {
      active: true,
      min: 400000,
      max: 600000,
      currency: "PKR",
      blocking: true,
    },
    max_notice_period: {
      active: true,
      value: 1,
      unit: "months",
      blocking: true,
    },
    status: "active",
    createdAt: new Date("2026-08-28T10:00:00.000Z"),
    updatedAt: new Date("2026-08-28T10:00:00.000Z"),
  },
];

// Seed function for jobs (must run before candidate seeds due to foreign key constraints)
export async function seedJobs() {
  console.log("Seeding jobs...");
  await db.insert(jobs).values(INITIAL_JOBS);
  console.log(`Successfully seeded ${INITIAL_JOBS.length} job(s).`);
}

// Standalone execution support
if (process.argv[1]?.includes("seeds/jobs")) {
  seedJobs()
    .then(() => conn.end())
    .catch((err) => {
      console.error("Failed to seed jobs:", err);
      process.exit(1);
    });
}
