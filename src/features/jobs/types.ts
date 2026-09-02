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
}
