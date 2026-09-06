import type {
  SkillRequirementItem,
  MinExperienceRequirement,
  EducationRequirement,
  LocationRequirement,
  WorkModeRequirement,
  CompensationBandRequirement,
  MaxNoticePeriodRequirement,
} from "@/entities/job";

export type RequirementMode = "hard" | "soft";

export interface FormFieldState {
  id: string;
  label: string;
  helperText: string;
  mode: RequirementMode;
  value: string | number;
  unit?: string;
  options?: string[];
  active?: boolean;
}

export interface CreateJobInput {
  title: string;
  department: string;
  location: string;
  employmentType: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  seniority_level?: string | null;

  // Canonical extraction / matching criteria
  skills_required?: SkillRequirementItem[];
  skills_preferred?: SkillRequirementItem[];
  min_experience?: MinExperienceRequirement;
  education_min?: EducationRequirement;
  location_requirement?: LocationRequirement;
  work_mode?: WorkModeRequirement;
  compensation_band?: CompensationBandRequirement;
  max_notice_period?: MaxNoticePeriodRequirement;

  status?: "draft" | "active" | "archived";
}

export interface UpdateJobInput {
  title?: string;
  department?: string;
  location?: string;
  employmentType?: "full-time" | "part-time" | "contract" | "remote";
  description?: string;
  seniority_level?: string | null;

  // Canonical extraction / matching criteria
  skills_required?: SkillRequirementItem[];
  skills_preferred?: SkillRequirementItem[];
  min_experience?: MinExperienceRequirement;
  education_min?: EducationRequirement;
  location_requirement?: LocationRequirement;
  work_mode?: WorkModeRequirement;
  compensation_band?: CompensationBandRequirement;
  max_notice_period?: MaxNoticePeriodRequirement;

  status?: "draft" | "active" | "archived";
}
