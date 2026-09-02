import { Job, CreateJobInput, UpdateJobInput } from "@/types";

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
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
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
    const now = new Date().toISOString();

    const job: Job = {
      id,
      title: input.title,
      department: input.department,
      location: input.location,
      employmentType: input.employmentType,
      description: input.description,
      hardCriteria: {
        minYearsExperience: input.hardCriteria.minYearsExperience,
        mandatorySkills: [...input.hardCriteria.mandatorySkills],
        locationRequirement: input.hardCriteria.locationRequirement,
        requiresWorkAuthorization: input.hardCriteria.requiresWorkAuthorization ?? true,
        isStrictKnockout: input.hardCriteria.isStrictKnockout ?? true,
      },
      softCriteria: {
        preferredSkills: [...(input.softCriteria?.preferredSkills || [])],
        bonusQualifications: [...(input.softCriteria?.bonusQualifications || [])],
        weight: input.softCriteria?.weight ?? 3,
      },
      customRequirements: input.customRequirements ? [...input.customRequirements] : [],
      status: input.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(id, job);
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
      hardCriteria: input.hardCriteria
        ? { ...existing.hardCriteria, ...input.hardCriteria }
        : existing.hardCriteria,
      softCriteria: input.softCriteria
        ? { ...existing.softCriteria, ...input.softCriteria }
        : existing.softCriteria,
      customRequirements: input.customRequirements !== undefined
        ? input.customRequirements
        : existing.customRequirements,
      updatedAt: new Date().toISOString(),
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
      hardCriteria: {
        minYearsExperience: 5,
        mandatorySkills: ["TypeScript", "React", "Node.js"],
        locationRequirement: "United States",
        requiresWorkAuthorization: true,
        isStrictKnockout: true,
      },
      softCriteria: {
        preferredSkills: ["Next.js", "Tailwind CSS", "PostgreSQL"],
        bonusQualifications: ["Experience building ATS or AI-assisted recruitment tools"],
        weight: 4,
      },
      customRequirements: [
        {
          id: "req-1",
          category: "System Design",
          description: "Must demonstrate experience with event-driven architecture",
          isDealbreaker: true,
        },
      ],
      status: "active",
      createdAt: "2026-08-28T10:00:00.000Z",
      updatedAt: "2026-08-28T10:00:00.000Z",
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
