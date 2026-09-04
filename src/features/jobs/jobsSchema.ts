import { z } from "zod";
import {
  SkillRequirementItemSchema,
  MinExperienceRequirementSchema,
  EducationRequirementSchema,
  LocationRequirementSchema,
  WorkModeRequirementSchema,
  CompensationBandRequirementSchema,
  MaxNoticePeriodRequirementSchema,
} from "@/entities/extraction/job/requirements";

export const CreateJobSchema = z.object({
  title: z
    .string({ required_error: "Job title is required" })
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title cannot exceed 100 characters"),
  department: z
    .string({ required_error: "Department is required" })
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department cannot exceed 100 characters"),
  location: z
    .string({ required_error: "Location is required" })
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location cannot exceed 100 characters"),
  employmentType: z.enum(["full-time", "part-time", "contract", "remote"], {
    errorMap: () => ({ message: "Employment type must be full-time, part-time, contract, or remote" }),
  }),
  description: z
    .string({ required_error: "Job description is required" })
    .min(10, "Job description must be at least 10 characters")
    .max(5000, "Job description cannot exceed 5000 characters"),
  seniority_level: z.string().nullable().optional(),

  // Canonical extraction / matching criteria
  skills_required: z.array(SkillRequirementItemSchema).optional().default([]),
  skills_preferred: z.array(SkillRequirementItemSchema).optional().default([]),
  min_experience: MinExperienceRequirementSchema.optional(),
  education_min: EducationRequirementSchema.optional(),
  location_requirement: LocationRequirementSchema.optional(),
  work_mode: WorkModeRequirementSchema.optional(),
  compensation_band: CompensationBandRequirementSchema.optional(),
  max_notice_period: MaxNoticePeriodRequirementSchema.optional(),

  status: z.enum(["draft", "active", "archived"]).default("active"),
});

export const UpdateJobSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters").max(100).optional(),
  department: z.string().min(2, "Department must be at least 2 characters").max(100).optional(),
  location: z.string().min(2, "Location must be at least 2 characters").max(100).optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "remote"]).optional(),
  description: z.string().min(10, "Job description must be at least 10 characters").max(5000).optional(),
  seniority_level: z.string().nullable().optional(),

  // Canonical extraction / matching criteria
  skills_required: z.array(SkillRequirementItemSchema).optional(),
  skills_preferred: z.array(SkillRequirementItemSchema).optional(),
  min_experience: MinExperienceRequirementSchema.optional(),
  education_min: EducationRequirementSchema.optional(),
  location_requirement: LocationRequirementSchema.optional(),
  work_mode: WorkModeRequirementSchema.optional(),
  compensation_band: CompensationBandRequirementSchema.optional(),
  max_notice_period: MaxNoticePeriodRequirementSchema.optional(),

  status: z.enum(["draft", "active", "archived"]).optional(),
});

export type CreateJobSchemaType = z.infer<typeof CreateJobSchema>;
export type UpdateJobSchemaType = z.infer<typeof UpdateJobSchema>;
