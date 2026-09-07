import type { WorkHistoryExtraction, WorkHistoryEntry } from "@/entities/extraction/candidate/aspects/workHistory";
import type { EvaluatedExperienceRequirement } from "@/features/review/core/evaluators/evaluationStatuses";

export type FixtureCategory =
  | "user_reported_bug"
  | "concurrency_overlap"
  | "contract_freelance"
  | "date_formats"
  | "standard_progression"
  | "custom";

export interface ExpectedRole {
  title?: string;
  employer?: string;
  startDate?: string;
  endDate?: string | null;
  employmentType?: string;
  approxMonths?: number;
}

export interface ExperienceTestFixture {
  id: string;
  title: string;
  description: string;
  category: FixtureCategory;
  resumeText: string;
  expected: {
    totalYears: number; // Stated calendar/career duration across all occupancies
    fullTimeYears: number; // Strictly full-time tenure
    rolesCount: number;
    roles?: ExpectedRole[];
  };
  targetJobRequirement: {
    minYears: number;
    blocking: boolean;
  };
  toleranceYears: number; // Acceptable delta, e.g. 0.2
  createdAt: string;
  isCustom?: boolean;
}

export interface ExtractedOccupancyAnalysis {
  entryId: string;
  employer: string;
  title: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  employmentType: {
    value: "full_time" | "internship" | "contract" | "freelance";
    status: "confirmed" | "inferred";
  };
  durationMonths: number;
  durationYears: number;
  includedInVerified: boolean;
  exclusionReason?: string;
  rawDescription: string;
}

export interface EvalDiagnostic {
  level: "info" | "warning" | "error";
  code: string;
  title: string;
  detail: string;
}

export interface ExperienceEvalResult {
  fixtureId: string;
  fixtureTitle: string;
  timestamp: string;
  durationMs: number;
  model: string;
  provider: string;
  status: "pass" | "fail" | "warn";
  rawExtraction: WorkHistoryExtraction;
  evaluatorOutput: EvaluatedExperienceRequirement | null;
  summary: {
    expectedTotalYears: number;
    expectedFullTimeYears: number;
    extractedVerifiedYears: number;
    extractedTotalRawYears: number;
    calendarDeduplicatedYears: number;
    deltaVerifiedYears: number;
    deltaTotalYears: number;
    rolesFound: number;
    fullTimeRolesCount: number;
    nonFullTimeRolesCount: number;
  };
  entries: ExtractedOccupancyAnalysis[];
  diagnostics: EvalDiagnostic[];
}

export interface BatchEvalSummary {
  totalFixtures: number;
  passed: number;
  warned: number;
  failed: number;
  passRate: number;
  averageDeltaYears: number;
  totalDurationMs: number;
  results: ExperienceEvalResult[];
}
