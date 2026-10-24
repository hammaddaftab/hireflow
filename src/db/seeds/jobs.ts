// Persistent database seeder for jobs entity
// Defines baseline job requirements and criteria

import { db, jobs, conn } from "@/db";
import type { Job } from "@/entities/job";
import { normalizeSkill, normalizeFieldOfStudy } from "@/lib/extraction/server";

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-grad-ai-swe",
    title: "AI / ML & Full-Stack Software Engineer",
    department: "Applied AI & Product Engineering",
    location: "Islamabad / Lahore, Pakistan (Hybrid)",
    employmentType: "full-time",
    description:
      "Hiring top graduating BS Computer Science engineers to build production AI/ML systems (LLMs, RAG, computer vision, predictive modeling) and full-stack web/mobile products. " +
      "All candidates meet the baseline BS CS degree requirement; we seek standout research depth, quantified engineering impact, complex system builds, and selective lab or international experience.",
    seniority_level: "Entry-Level / Junior (0-1 yrs)",
    skills_required: [
      { active: true, skill: normalizeSkill("Python"), blocking: true },
      { active: true, skill: normalizeSkill("Machine Learning"), blocking: true },
      { active: true, skill: normalizeSkill("React"), blocking: true },
      { active: true, skill: normalizeSkill("SQL"), blocking: true },
    ],
    skills_preferred: [
      { active: true, skill: normalizeSkill("PyTorch"), blocking: false },
      { active: true, skill: normalizeSkill("TensorFlow"), blocking: false },
      { active: true, skill: normalizeSkill("FastAPI"), blocking: false },
      { active: true, skill: normalizeSkill("Next.js"), blocking: false },
      { active: true, skill: normalizeSkill("Node.js"), blocking: false },
      { active: true, skill: normalizeSkill("Docker"), blocking: false },
    ],
    min_experience: { active: true, years: 0, blocking: true },
    education_min: {
      active: true,
      degree_level: "bachelors",
      field: normalizeFieldOfStudy("Computer Science"),
      blocking: false,
    },
    location_requirement: {
      active: true,
      city: "Islamabad",
      province: "Islamabad Capital Territory",
      blocking: false,
    },
    work_mode: { active: false, mode: "hybrid", blocking: false },
    compensation_band: { active: true, min: 120000, max: 220000, currency: "PKR", blocking: false },
    max_notice_period: { active: true, value: 30, unit: "days", blocking: false },
    status: "active",
    createdAt: new Date("2026-10-20T10:00:00.000Z"),
    updatedAt: new Date("2026-10-20T10:00:00.000Z"),
  },
  {
    id: "job-sample-1",
    title: "Backend Engineer (Go)",
    department: "Engineering",
    location: "Islamabad, Pakistan (Hybrid)",
    employmentType: "full-time",
    description:
      "We run the order-routing and settlement backend for a growing logistics platform. " +
      "You will own Go services end to end: API design, PostgreSQL schema evolution, and containerised deployments, " +
      "working with a small team in Islamabad on a hybrid schedule. " +
      "We care more about what you shipped and what it changed than about how many tools you list.",
    seniority_level: "Mid-Senior",
    skills_required: [
      { active: true, skill: normalizeSkill("Go"), blocking: true },
      { active: true, skill: normalizeSkill("PostgreSQL"), blocking: true },
      { active: true, skill: normalizeSkill("Docker"), blocking: true },
      { active: true, skill: normalizeSkill("REST API"), blocking: true },
    ],
    skills_preferred: [
      { active: true, skill: normalizeSkill("Linux"), blocking: false },
      { active: true, skill: normalizeSkill("Kubernetes"), blocking: false },
      { active: true, skill: normalizeSkill("AWS"), blocking: false },
      { active: true, skill: normalizeSkill("Redis"), blocking: false },
      { active: true, skill: normalizeSkill("gRPC"), blocking: false },
      { active: true, skill: normalizeSkill("Apache Kafka"), blocking: false },
    ],
    min_experience: { active: true, years: 4, blocking: true },
    education_min: {
      active: true,
      degree_level: "bachelors",
      field: normalizeFieldOfStudy("Computer Science"),
      blocking: false,
    },
    location_requirement: {
      active: true,
      city: "Islamabad",
      province: "Islamabad Capital Territory",
      blocking: false,
    },
    work_mode: { active: false, mode: "hybrid", blocking: false },
    compensation_band: { active: true, min: 300000, max: 450000, currency: "PKR", blocking: true },
    max_notice_period: { active: true, value: 30, unit: "days", blocking: true },
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
