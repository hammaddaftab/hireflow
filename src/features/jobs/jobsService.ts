// Service for job postings and criteria persisted directly in PostgreSQL via Drizzle ORM

import { produce } from "immer";
import { eq, desc, and, or, ilike, type SQL } from "drizzle-orm";
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

export function normalizeJobActiveFlags(job: Job): Job {
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
  // Query all jobs from PostgreSQL ordered by newest first
  async getAllJobs(filters?: { status?: string; search?: string }): Promise<Job[]> {
    const conditions: SQL[] = [];

    if (filters?.status) {
      conditions.push(eq(jobs.status, filters.status));
    }

    if (filters?.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(jobs.title, term),
          ilike(jobs.department, term),
          ilike(jobs.location, term),
          ilike(jobs.description, term)
        )!
      );
    }

    const query = db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt));

    const rows = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    return rows.map(normalizeJobActiveFlags);
  }

  // Get a single job by ID from PostgreSQL
  async getJobById(id: string): Promise<Job | null> {
    const rows = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return normalizeJobActiveFlags(rows[0]);
  }

  // Insert a new job into PostgreSQL
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

    await db.insert(jobs).values(job);
    return job;
  }

  // Update an existing job in PostgreSQL
  async updateJob(id: string, input: UpdateJobInput): Promise<Job | null> {
    const existing = await this.getJobById(id);
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

    await db.update(jobs).set(updated).where(eq(jobs.id, id));
    return updated;
  }

  // Delete a job by ID from PostgreSQL
  async deleteJob(id: string): Promise<boolean> {
    const result = await db
      .delete(jobs)
      .where(eq(jobs.id, id))
      .returning({ id: jobs.id });

    return result.length > 0;
  }

  // Clear all jobs from PostgreSQL
  async clear(): Promise<void> {
    await db.delete(jobs);
  }
}

// Global singleton instance for database-backed jobs operations
export const jobsService = new JobsService();
export const jobService = jobsService;
