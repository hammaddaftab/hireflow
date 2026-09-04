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

export class JobsService {
  private jobs: Map<string, Job> = new Map();

  constructor(initialJobs?: Job[]) {
    if (initialJobs) {
      initialJobs.forEach((j) => this.jobs.set(j.id, j));
    }
  }

  async getAllJobs(filters?: { status?: string; search?: string }): Promise<Job[]> {
    let list = Array.from(this.jobs.values());

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
    return this.jobs.get(id) || null;
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const skillsRequired = input.skills_required ?? [];
    const skillsPreferred = input.skills_preferred ?? [];

    const minExperience: MinExperienceRequirement = input.min_experience ?? {
      years: 0,
      blocking: false,
    };

    const educationMin: EducationRequirement = input.education_min ?? {
      degree_level: null,
      field: null,
      blocking: false,
    };

    const locationReq: LocationRequirement = input.location_requirement ?? {
      city: null,
      province: null,
      blocking: false,
    };

    const workModeReq: WorkModeRequirement = input.work_mode ?? {
      mode: "hybrid",
      blocking: false,
    };

    const compensationBand: CompensationBandRequirement = input.compensation_band ?? {
      min: null,
      max: null,
      currency: "PKR",
      blocking: false,
    };

    const maxNoticePeriod: MaxNoticePeriodRequirement = input.max_notice_period ?? {
      value: null,
      unit: "days",
      blocking: false,
    };

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
      skills_required: input.skills_required ?? existing.skills_required,
      skills_preferred: input.skills_preferred ?? existing.skills_preferred,
      min_experience: input.min_experience !== undefined
        ? (input.min_experience ? { ...existing.min_experience, ...input.min_experience } : existing.min_experience)
        : existing.min_experience,
      education_min: input.education_min !== undefined
        ? (input.education_min ? { ...existing.education_min, ...input.education_min } : existing.education_min)
        : existing.education_min,
      location_requirement: input.location_requirement !== undefined
        ? (input.location_requirement ? { ...existing.location_requirement, ...input.location_requirement } : existing.location_requirement)
        : existing.location_requirement,
      work_mode: input.work_mode !== undefined
        ? (input.work_mode ? { ...existing.work_mode, ...input.work_mode } : existing.work_mode)
        : existing.work_mode,
      compensation_band: input.compensation_band !== undefined
        ? (input.compensation_band ? { ...existing.compensation_band, ...input.compensation_band } : existing.compensation_band)
        : existing.compensation_band,
      max_notice_period: input.max_notice_period !== undefined
        ? (input.max_notice_period ? { ...existing.max_notice_period, ...input.max_notice_period } : existing.max_notice_period)
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
    if (this.jobs.size > 0) return;

    const sampleJob: Job = {
      id: "job-sample-1",
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "San Francisco, CA (Remote)",
      employmentType: "full-time",
      description: "We are seeking an experienced Full Stack Engineer to lead next-generation hiring intelligence tools.",
      seniority_level: "Senior Level",
      skills_required: [
        { skill: "TypeScript", blocking: true },
        { skill: "React", blocking: true },
        { skill: "Node.js", blocking: true },
      ],
      skills_preferred: [
        { skill: "Next.js", blocking: false },
        { skill: "Tailwind CSS", blocking: false },
        { skill: "PostgreSQL", blocking: false },
      ],
      min_experience: {
        years: 5,
        blocking: true,
      },
      education_min: {
        degree_level: "bachelors",
        field: "Computer Science",
        blocking: true,
      },
      location_requirement: {
        city: "San Francisco",
        province: "CA",
        blocking: false,
      },
      work_mode: {
        mode: "remote",
        blocking: true,
      },
      compensation_band: {
        min: 400000,
        max: 600000,
        currency: "PKR",
        blocking: true,
      },
      max_notice_period: {
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
