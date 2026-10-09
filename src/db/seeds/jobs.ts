// Persistent database seeder for jobs entity
// Defines baseline job requirements and criteria

import { db, jobs, conn } from "@/db";
import type { Job } from "@/entities/job";
import { normalizeSkill } from "@/features/extraction/skillNormalizer";
import { normalizeFieldOfStudy } from "@/features/extraction/fieldOfStudyNormalizer";

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-sample-1",
    title: "Backend Engineer",
    department: "Engineering",
    location: "Islamabad, Pakistan (Onsite)",
    employmentType: "full-time",
    description: null,
    seniority_level: null,
    skills_required: [
      { active: true, skill: normalizeSkill("Go"), blocking: true },
      { active: true, skill: normalizeSkill("Docker"), blocking: true },
      { active: true, skill: normalizeSkill("PostgreSQL"), blocking: true },
      { active: true, skill: normalizeSkill("REST API"), blocking: true },
      { active: true, skill: normalizeSkill("Distributed Systems"), blocking: true },
      { active: true, skill: normalizeSkill("Linux"), blocking: true },
      { active: true, skill: normalizeSkill("Bash"), blocking: true },
      { active: true, skill: normalizeSkill("Concurrency & Multithreading"), blocking: true },
      { active: true, skill: normalizeSkill("CI/CD"), blocking: true },
      { active: true, skill: normalizeSkill("Agile Methodologies"), blocking: true },
      { active: true, skill: normalizeSkill("Code Review"), blocking: true },
    ],
    skills_preferred: [
      { active: true, skill: normalizeSkill("Kubernetes"), blocking: false },
      { active: true, skill: normalizeSkill("AWS"), blocking: false },
      { active: true, skill: normalizeSkill("Redis"), blocking: false },
      { active: true, skill: normalizeSkill("Apache Kafka"), blocking: false },
      { active: true, skill: normalizeSkill("Elasticsearch"), blocking: false },
      { active: true, skill: normalizeSkill("MongoDB"), blocking: false },
      { active: true, skill: normalizeSkill("gRPC"), blocking: false },
      { active: true, skill: normalizeSkill("Helm"), blocking: false },
      { active: true, skill: normalizeSkill("Load Balancing"), blocking: false },
      { active: true, skill: normalizeSkill("Network Security"), blocking: false },
    ],
    min_experience: {
      active: true,
      years: 4,
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
      city: "Islamabad",
      province: "Islamabad Capital Territory",
      blocking: true,
    },
    work_mode: {
      active: true,
      mode: "onsite",
      blocking: true,
    },
    compensation_band: {
      active: true,
      min: 600,
      max: 800,
      currency: "USD",
      blocking: false,
    },
    max_notice_period: {
      active: false,
      value: null,
      unit: null,
      blocking: false,
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
