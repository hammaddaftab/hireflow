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

export interface HardKnockoutCriteria {
  minYearsExperience: number;
  mandatorySkills: string[];
  locationRequirement?: string;
  requiresWorkAuthorization: boolean;
  isStrictKnockout: boolean;
}

export interface SoftScoringCriteria {
  preferredSkills: string[];
  bonusQualifications: string[];
  weight: number; // 1 to 5
}

export interface JobRequirement {
  id: string;
  category: string;
  description: string;
  isDealbreaker: boolean;
  weight?: number;
}

export interface CompensationBandCriteria {
  min: number | null;
  max: number | null;
  currency: string | null;
  blocking: boolean;
}

export interface MaxNoticePeriodCriteria {
  value: number | null;
  unit: "days" | "weeks" | "months" | null;
  blocking: boolean;
}

export interface EducationCriteria {
  degree_level: "bachelors" | "masters" | "doctorate" | "diploma" | "high_school" | null;
  field: string | null;
  blocking: boolean;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  hardCriteria: HardKnockoutCriteria;
  softCriteria: SoftScoringCriteria;
  customRequirements: JobRequirement[];
  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
  compensation_band?: CompensationBandCriteria;
  max_notice_period?: MaxNoticePeriodCriteria;
  education_min?: EducationCriteria;
}

export interface CreateJobInput {
  title: string;
  department: string;
  location: string;
  employmentType: "full-time" | "part-time" | "contract" | "remote";
  description: string;
  hardCriteria: HardKnockoutCriteria;
  softCriteria: SoftScoringCriteria;
  customRequirements?: JobRequirement[];
  status?: "draft" | "active" | "archived";
  compensation_band?: CompensationBandCriteria;
  max_notice_period?: MaxNoticePeriodCriteria;
  education_min?: EducationCriteria;
}

export interface UpdateJobInput {
  title?: string;
  department?: string;
  location?: string;
  employmentType?: "full-time" | "part-time" | "contract" | "remote";
  description?: string;
  hardCriteria?: Partial<HardKnockoutCriteria>;
  softCriteria?: Partial<SoftScoringCriteria>;
  customRequirements?: JobRequirement[];
  status?: "draft" | "active" | "archived";
  compensation_band?: Partial<CompensationBandCriteria>;
  max_notice_period?: Partial<MaxNoticePeriodCriteria>;
  education_min?: Partial<EducationCriteria>;
}
