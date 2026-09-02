import { z } from "zod";

export const HardKnockoutCriteriaSchema = z.object({
  minYearsExperience: z
    .number({ invalid_type_error: "Minimum years of experience must be a number" })
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience cannot exceed 50"),
  mandatorySkills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one mandatory skill is required"),
  locationRequirement: z.string().optional(),
  requiresWorkAuthorization: z.boolean().default(true),
  isStrictKnockout: z.boolean().default(true),
});

export const SoftScoringCriteriaSchema = z.object({
  preferredSkills: z.array(z.string()).default([]),
  bonusQualifications: z.array(z.string()).default([]),
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .int("Weight must be an integer")
    .min(1, "Weight must be at least 1")
    .max(5, "Weight cannot exceed 5")
    .default(3),
});

export const JobRequirementSchema = z.object({
  id: z.string().min(1, "Requirement ID is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  isDealbreaker: z.boolean().default(false),
  weight: z.number().min(1).max(5).optional(),
});

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
  hardCriteria: HardKnockoutCriteriaSchema,
  softCriteria: SoftScoringCriteriaSchema,
  customRequirements: z.array(JobRequirementSchema).optional().default([]),
  status: z.enum(["draft", "active", "archived"]).default("active"),
});

export const UpdateJobSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters").max(100).optional(),
  department: z.string().min(2, "Department must be at least 2 characters").max(100).optional(),
  location: z.string().min(2, "Location must be at least 2 characters").max(100).optional(),
  employmentType: z.enum(["full-time", "part-time", "contract", "remote"]).optional(),
  description: z.string().min(10, "Job description must be at least 10 characters").max(5000).optional(),
  hardCriteria: HardKnockoutCriteriaSchema.partial().optional(),
  softCriteria: SoftScoringCriteriaSchema.partial().optional(),
  customRequirements: z.array(JobRequirementSchema).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

export type CreateJobSchemaType = z.infer<typeof CreateJobSchema>;
export type UpdateJobSchemaType = z.infer<typeof UpdateJobSchema>;
export type HardKnockoutSchemaType = z.infer<typeof HardKnockoutCriteriaSchema>;
export type SoftScoringSchemaType = z.infer<typeof SoftScoringCriteriaSchema>;
