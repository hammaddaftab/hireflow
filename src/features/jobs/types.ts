import type {
  SkillRequirementItem,
  MinExperienceRequirement,
  EducationRequirement,
  LocationRequirement,
  WorkModeRequirement,
  CompensationBandRequirement,
  MaxNoticePeriodRequirement,
} from "@/features/extraction/job/requirements";

export type RequirementMode = "hard" | "soft";

export interface FormFieldState {
  id: string;
  label: string;
  helperText: string;
  mode: RequirementMode;
  value: string | number;
  unit?: string;
  options?: string[];
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  seniority_level?: string | null;

  // Canonical extraction / matching criteria
  skills_required: SkillRequirementItem[];
  skills_preferred: SkillRequirementItem[];
  min_experience: MinExperienceRequirement;
  education_min: EducationRequirement;
  location_requirement: LocationRequirement;
  work_mode: WorkModeRequirement;
  compensation_band: CompensationBandRequirement;
  max_notice_period: MaxNoticePeriodRequirement;

  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
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
  min_experience?: Partial<MinExperienceRequirement>;
  education_min?: Partial<EducationRequirement>;
  location_requirement?: Partial<LocationRequirement>;
  work_mode?: Partial<WorkModeRequirement>;
  compensation_band?: Partial<CompensationBandRequirement>;
  max_notice_period?: Partial<MaxNoticePeriodRequirement>;

  status?: "draft" | "active" | "archived";
}
