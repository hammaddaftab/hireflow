import { produce } from "immer";
import { eq } from "drizzle-orm";
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
  return produce(job, (draft) => {
    // Normalize active flags on mandatory skills
    if (draft.skills_required) {
      draft.skills_required = draft.skills_required.map((s) => {
        if (s.active === false) {
          return { active: false, blocking: s.blocking };
        }
        return {
          active: true,
          skill: "skill" in s && typeof s.skill === "string" ? s.skill : "",
          blocking: s.blocking ?? true,
        };
      });
    }

    // Normalize active flags on preferred skills
    if (draft.skills_preferred) {
      draft.skills_preferred = draft.skills_preferred.map((s) => {
        if (s.active === false) {
          return { active: false, blocking: s.blocking };
        }
        return {
          active: true,
          skill: "skill" in s && typeof s.skill === "string" ? s.skill : "",
          blocking: s.blocking ?? false,
        };
      });
    }

    // Normalize structured criteria with active booleans
    const criteriaKeys = [
      "min_experience",
      "education_min",
      "location_requirement",
      "work_mode",
      "compensation_band",
      "max_notice_period",
    ] as const;

    for (const key of criteriaKeys) {
      const item = draft[key];
      if (item) {
        item.active = item.active !== false;
      }
    }
  });
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

    const updated = produce(existing, (draft) => {
      // Direct updates to role identity and status
      if (input.title !== undefined) draft.title = input.title;
      if (input.department !== undefined) draft.department = input.department;
      if (input.location !== undefined) draft.location = input.location;
      if (input.employmentType !== undefined) draft.employmentType = input.employmentType;
      if (input.description !== undefined) draft.description = input.description;
      if (input.seniority_level !== undefined) draft.seniority_level = input.seniority_level;
      if (input.status !== undefined) draft.status = input.status;

      // Update skills with canonical normalization
      if (input.skills_required !== undefined) {
        draft.skills_required = input.skills_required.map((s) =>
          s.active === false
            ? { ...s, active: false as const }
            : { ...s, active: true as const, skill: normalizeSkill(s.skill), blocking: s.blocking ?? true }
        );
      }
      if (input.skills_preferred !== undefined) {
        draft.skills_preferred = input.skills_preferred.map((s) =>
          s.active === false
            ? { ...s, active: false as const }
            : { ...s, active: true as const, skill: normalizeSkill(s.skill), blocking: s.blocking ?? false }
        );
      }

      // Update structured criteria
      if (input.min_experience !== undefined) {
        draft.min_experience =
          input.min_experience.active === false
            ? { active: false as const, blocking: input.min_experience.blocking }
            : { ...input.min_experience, active: true as const };
      }
      if (input.education_min !== undefined) {
        draft.education_min =
          input.education_min.active === false
            ? { active: false as const, blocking: input.education_min.blocking }
            : {
                ...input.education_min,
                active: true as const,
                field: input.education_min.field ? normalizeFieldOfStudy(input.education_min.field) : null,
              };
      }
      if (input.location_requirement !== undefined) {
        draft.location_requirement =
          input.location_requirement.active === false
            ? { active: false as const, blocking: input.location_requirement.blocking }
            : { ...input.location_requirement, active: true as const };
      }
      if (input.work_mode !== undefined) {
        draft.work_mode =
          input.work_mode.active === false
            ? { active: false as const, blocking: input.work_mode.blocking }
            : { ...input.work_mode, active: true as const };
      }
      if (input.compensation_band !== undefined) {
        draft.compensation_band =
          input.compensation_band.active === false
            ? { active: false as const, blocking: input.compensation_band.blocking }
            : { ...input.compensation_band, active: true as const };
      }
      if (input.max_notice_period !== undefined) {
        draft.max_notice_period =
          input.max_notice_period.active === false
            ? { active: false as const, blocking: input.max_notice_period.blocking }
            : { ...input.max_notice_period, active: true as const };
      }

      draft.updatedAt = new Date();
    });

    this.jobs.set(id, updated);

    // Persist to Drizzle database table
    try {
      await db.update(jobs).set(updated).where(eq(jobs.id, id));
    } catch (dbErr) {
      console.warn("Drizzle database job update warning (in-memory updated):", dbErr instanceof Error ? dbErr.message : String(dbErr));
    }

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
      // TODO: Remove description and seniority_level in a future schema cleanup
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
