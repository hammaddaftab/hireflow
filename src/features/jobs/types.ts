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

export type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  HardKnockoutCriteria,
  SoftScoringCriteria,
  JobRequirement,
} from "@/types";
