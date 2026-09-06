import { db, jobs } from "@/db";
import type {
  Job,
  MinExperienceRequirement,
  EducationRequirement,
  LocationRequirement,
  WorkModeRequirement,
  CompensationBandRequirement,
  MaxNoticePeriodRequirement,
} from "@/entities/job";
import type { CreateJobInput, UpdateJobInput } from "./types";
import { normalizeSkill } from "@/features/extraction/skillNormalizer";
import { normalizeFieldOfStudy } from "@/features/extraction/fieldOfStudyNormalizer";

function normalizeJobActiveFlags(job: Job): Job {
  return {
    ...job,
    skills_required: (job.skills_required || []).map((s) =>
      s.active === false
        ? { ...s, active: false as const }
        : {
            ...s,
            active: true as const,
            skill: "skill" in s && typeof s.skill === "string" ? s.skill : "",
            blocking: s.blocking ?? true,
          }
    ),
    skills_preferred: (job.skills_preferred || []).map((s) =>
      s.active === false
        ? { ...s, active: false as const }
        : {
            ...s,
            active: true as const,
            skill: "skill" in s && typeof s.skill === "string" ? s.skill : "",
            blocking: s.blocking ?? false,
          }
    ),
    min_experience: job.min_experience
      ? (job.min_experience.active === false
          ? { active: false as const, blocking: job.min_experience.blocking }
          : { ...job.min_experience, active: true as const })
      : { active: false as const, blocking: false },
    education_min: job.education_min
      ? (job.education_min.active === false
          ? { active: false as const, blocking: job.education_min.blocking }
          : { ...job.education_min, active: true as const })
      : { active: false as const, blocking: false },
    location_requirement: job.location_requirement
      ? (job.location_requirement.active === false
          ? { active: false as const, blocking: job.location_requirement.blocking }
          : { ...job.location_requirement, active: true as const })
      : { active: false as const, blocking: false },
    work_mode: job.work_mode
      ? (job.work_mode.active === false
          ? { active: false as const, blocking: job.work_mode.blocking }
          : { ...job.work_mode, active: true as const })
      : { active: false as const, blocking: false },
    compensation_band: job.compensation_band
      ? (job.compensation_band.active === false
          ? { active: false as const, blocking: job.compensation_band.blocking }
          : { ...job.compensation_band, active: true as const })
      : { active: false as const, blocking: false },
    max_notice_period: job.max_notice_period
      ? (job.max_notice_period.active === false
          ? { active: false as const, blocking: job.max_notice_period.blocking }
          : { ...job.max_notice_period, active: true as const })
      : { active: false as const, blocking: false },
  };
}

export class JobsService {
  private jobs: Map<string, Job> = new Map();

  constructor(initialJobs?: Job[]) {
    if (initialJobs) {
      initialJobs.forEach((j) => this.jobs.set(j.id, normalizeJobActiveFlags(j)));
    }
  }

  async getAllJobs(filters?: { status?: string; search?: string }): Promise<Job[]> {
    let list = Array.from(this.jobs.values()).map(normalizeJobActiveFlags);

    if (filters?.status) {
      list = list.filter((j) => j.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.department ? j.department.toLowerCase().includes(q) : false) ||
          (j.location ? j.location.toLowerCase().includes(q) : false) ||
          (j.description ? j.description.toLowerCase().includes(q) : false)
      );
    }

    // Sort by createdAt descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJobById(id: string): Promise<Job | null> {
    const job = this.jobs.get(id);
    return job ? normalizeJobActiveFlags(job) : null;
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const skillsRequired = (input.skills_required ?? []).map((s) =>
      s.active === false
        ? { ...s, active: false as const }
        : {
            ...s,
            active: true as const,
            skill: normalizeSkill(s.skill),
            blocking: s.blocking ?? true,
          }
    );
    const skillsPreferred = (input.skills_preferred ?? []).map((s) =>
      s.active === false
        ? { ...s, active: false as const }
        : {
            ...s,
            active: true as const,
            skill: normalizeSkill(s.skill),
            blocking: s.blocking ?? false,
          }
    );

    const minExperience: MinExperienceRequirement =
      input.min_experience && input.min_experience.active !== false
        ? { ...input.min_experience, active: true as const }
        : { active: false as const, blocking: input.min_experience?.blocking };

    const educationMin: EducationRequirement =
      input.education_min && input.education_min.active !== false
        ? {
            ...input.education_min,
            active: true as const,
            field: input.education_min.field ? normalizeFieldOfStudy(input.education_min.field) : null,
          }
        : { active: false as const, blocking: input.education_min?.blocking };

    const locationReq: LocationRequirement =
      input.location_requirement && input.location_requirement.active !== false
        ? { ...input.location_requirement, active: true as const }
        : { active: false as const, blocking: input.location_requirement?.blocking };

    const workModeReq: WorkModeRequirement =
      input.work_mode && input.work_mode.active !== false
        ? { ...input.work_mode, active: true as const }
        : { active: false as const, blocking: input.work_mode?.blocking };

    const compensationBand: CompensationBandRequirement =
      input.compensation_band && input.compensation_band.active !== false
        ? { ...input.compensation_band, active: true as const }
        : { active: false as const, blocking: input.compensation_band?.blocking };

    const maxNoticePeriod: MaxNoticePeriodRequirement =
      input.max_notice_period && input.max_notice_period.active !== false
        ? { ...input.max_notice_period, active: true as const }
        : { active: false as const, blocking: input.max_notice_period?.blocking };

    const job: Job = {
      id,
      title: input.title,
      department: input.department ?? null,
      location: input.location ?? null,
      employmentType: input.employmentType ?? null,
      description: input.description ?? null,
      seniority_level: input.seniority_level ?? null,

      // Canonical criteria fields
      skills_required: skillsRequired,
      skills_preferred: skillsPreferred,
      min_experience: minExperience,
      education_min: educationMin,
      location_requirement: locationReq,
      work_mode: workModeReq,
      compensation_band: compensationBand,
      max_notice_period: maxNoticePeriod,

      status: input.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(id, job);

    // Persist to Drizzle database table
    try {
      await db.insert(jobs).values(job).onConflictDoNothing();
    } catch (dbErr) {
      console.warn("Drizzle database job insert warning (skipped):", dbErr instanceof Error ? dbErr.message : String(dbErr));
    }

    return job;
  }

  async updateJob(id: string, input: UpdateJobInput): Promise<Job | null> {
    const existing = this.jobs.get(id);
    if (!existing) {
      return null;
    }

    const updated: Job = {
      ...existing,
      ...input,
      skills_required: input.skills_required
        ? input.skills_required.map((s) =>
            s.active === false
              ? { ...s, active: false as const }
              : { ...s, active: true as const, skill: normalizeSkill(s.skill), blocking: s.blocking ?? true }
          )
        : existing.skills_required,
      skills_preferred: input.skills_preferred
        ? input.skills_preferred.map((s) =>
            s.active === false
              ? { ...s, active: false as const }
              : { ...s, active: true as const, skill: normalizeSkill(s.skill), blocking: s.blocking ?? false }
          )
        : existing.skills_preferred,
      min_experience: input.min_experience !== undefined
        ? (input.min_experience.active === false
            ? { active: false as const, blocking: input.min_experience.blocking }
            : { ...input.min_experience, active: true as const })
        : existing.min_experience,
      education_min: input.education_min !== undefined
        ? (input.education_min.active === false
            ? { active: false as const, blocking: input.education_min.blocking }
            : {
                ...input.education_min,
                active: true as const,
                field: input.education_min.field ? normalizeFieldOfStudy(input.education_min.field) : null,
              })
        : existing.education_min,
      location_requirement: input.location_requirement !== undefined
        ? (input.location_requirement.active === false
            ? { active: false as const, blocking: input.location_requirement.blocking }
            : { ...input.location_requirement, active: true as const })
        : existing.location_requirement,
      work_mode: input.work_mode !== undefined
        ? (input.work_mode.active === false
            ? { active: false as const, blocking: input.work_mode.blocking }
            : { ...input.work_mode, active: true as const })
        : existing.work_mode,
      compensation_band: input.compensation_band !== undefined
        ? (input.compensation_band.active === false
            ? { active: false as const, blocking: input.compensation_band.blocking }
            : { ...input.compensation_band, active: true as const })
        : existing.compensation_band,
      max_notice_period: input.max_notice_period !== undefined
        ? (input.max_notice_period.active === false
            ? { active: false as const, blocking: input.max_notice_period.blocking }
            : { ...input.max_notice_period, active: true as const })
        : existing.max_notice_period,
      updatedAt: new Date(),
    };

    this.jobs.set(id, updated);
    return updated;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async clear(): Promise<void> {
    this.jobs.clear();
  }

  seedInitialData(): void {
    // Migrate any existing jobs in-memory so active defaults to true
    for (const [key, val] of this.jobs.entries()) {
      this.jobs.set(key, normalizeJobActiveFlags(val));
    }

    const sampleJob: Job = {
      id: "job-sample-1",
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "San Francisco, CA (Remote)",
      employmentType: "full-time",
      description: "We are seeking an experienced Full Stack Engineer to lead next-generation hiring intelligence tools.",
      seniority_level: "Senior Level",
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
    };

    this.jobs.set(sampleJob.id, sampleJob);
  }
}

// Global singleton instance for in-memory persistence in development / API routes
const globalForJobService = globalThis as unknown as { jobsService?: JobsService; jobService?: JobsService };
export const jobsService = globalForJobService.jobsService ?? globalForJobService.jobService ?? new JobsService();
export const jobService = jobsService;

if (process.env.NODE_ENV !== "production") {
  globalForJobService.jobsService = jobsService;
  globalForJobService.jobService = jobsService;
}
jobsService.seedInitialData();
