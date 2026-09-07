import { z } from "zod";
import { pgTable, text, timestamp, varchar, jsonb, numeric, integer } from "drizzle-orm/pg-core";
import { jobs } from "./job";
import {
  IdentityExtractionSchema,
  type IdentityExtraction,
} from "./extraction/candidate/aspects/identity";
import {
  WorkHistoryExtractionSchema,
  type WorkHistoryExtraction,
} from "./extraction/candidate/aspects/workHistory";
import {
  EducationExtractionSchema,
  type EducationExtraction,
} from "./extraction/candidate/aspects/education";
import {
  SkillsDemonstratedExtractionSchema,
  type SkillsDemonstratedExtraction,
} from "./extraction/candidate/aspects/skillsDemonstrated";
import {
  SkillsDeclaredExtractionSchema,
  type SkillsDeclaredExtraction,
} from "./extraction/candidate/aspects/skillsDeclared";
import {
  LogisticsExtractionSchema,
  type LogisticsExtraction,
} from "./extraction/candidate/aspects/logistics";
import {
  ExtractionMetadataSchema,
  type ExtractionMetadata,
} from "./extraction/candidate/aspects/extractionMetadata";

export interface SourceDocumentMetadata {
  filename: string;
  file_size_bytes?: number;
  mime_type: string;
  url?: string;
}

/**
 * Drizzle ORM table definition for candidates.
 * Contains both top-level SQL columns for high-velocity filtering/querying,
 * and typed JSONB columns preserving full multi-aspect extraction evidence.
 */
export const candidates = pgTable("candidates", {
  id: varchar("id", { length: 128 }).primaryKey(),
  appliedJobId: varchar("applied_job_id", { length: 128 }).references(() => jobs.id, { onDelete: "set null" }),

  // Identity & Contact
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  cnic: varchar("cnic", { length: 32 }),
  city: text("city"),
  province: text("province"),
  pdfUrl: text("pdf_url"),

  // Filterable Profile Summary
  currentRoleTitle: text("current_role_title"),
  currentCompany: text("current_company"),
  totalYearsExperience: numeric("total_years_experience"),
  highestDegreeLevel: varchar("highest_degree_level", { length: 32 }),
  highestDegreeField: text("highest_degree_field"),

  // Filterable Logistics
  expectedSalaryMin: numeric("expected_salary_min"),
  expectedSalaryMax: numeric("expected_salary_max"),
  salaryCurrency: varchar("salary_currency", { length: 8 }),
  noticePeriodDays: integer("notice_period_days"),

  // Source & Metadata
  sourceDocument: jsonb("source_document").$type<SourceDocumentMetadata>().notNull(),

  // Typed Evidence & Aspects
  identity: jsonb("identity").$type<IdentityExtraction>().notNull(),
  workHistory: jsonb("work_history").$type<WorkHistoryExtraction>().notNull(),
  education: jsonb("education").$type<EducationExtraction>().notNull(),
  skillsDemonstrated: jsonb("skills_demonstrated").$type<SkillsDemonstratedExtraction>().notNull(),
  skillsDeclared: jsonb("skills_declared").$type<SkillsDeclaredExtraction>().notNull(),
  logistics: jsonb("logistics").$type<LogisticsExtraction>().notNull(),
  extractionMetadata: jsonb("extraction_metadata").$type<ExtractionMetadata>().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CandidateRecord = typeof candidates.$inferSelect;
export type NewCandidateRecord = typeof candidates.$inferInsert;

/**
 * Full candidate profile matching the exact multi-aspect extraction output and candidates DB table.
 */
export const ParsedCandidateProfileSchema = z.object({
  id: z.string().describe("Unique candidate identifier, e.g. 'cand_1'"),
  applied_job_id: z.string().nullable().optional().describe("Associated job ID if applied directly"),
  created_at: z.string().describe("ISO timestamp when candidate record was created"),
  updated_at: z.string().describe("ISO timestamp when candidate record was last updated"),
  source_document: z.object({
    filename: z.string(),
    file_size_bytes: z.number().optional(),
    mime_type: z.string().default("application/pdf"),
    url: z.string().optional(),
  }),
  identity: IdentityExtractionSchema,
  work_history: WorkHistoryExtractionSchema,
  education: EducationExtractionSchema,
  skills_demonstrated: SkillsDemonstratedExtractionSchema,
  skills_declared: SkillsDeclaredExtractionSchema,
  logistics: LogisticsExtractionSchema,
  extraction_metadata: ExtractionMetadataSchema,
});

export type ParsedCandidateProfile = z.infer<typeof ParsedCandidateProfileSchema>;

const DEGREE_RANKS: Record<string, number> = {
  high_school: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

// Maps domain ParsedCandidateProfile to relational Drizzle candidate table insert row
export function candidateProfileToRow(profile: ParsedCandidateProfile): NewCandidateRecord {
  const activeRole = profile.work_history?.entries?.find((e) => e.is_current) || profile.work_history?.entries?.[0];
  const currentRoleTitle = activeRole?.title || null;
  const currentCompany = activeRole?.employer || null;

  const totalMonths = (profile.work_history?.entries || []).reduce((acc, entry) => {
    const start = new Date(entry.start_date).getTime();
    const end = entry.end_date ? new Date(entry.end_date).getTime() : Date.now();
    if (isNaN(start)) return acc;
    const validEnd = isNaN(end) ? Date.now() : end;
    const months = Math.max(1, Math.round((validEnd - start) / (1000 * 60 * 60 * 24 * 30.4375)));
    return acc + months;
  }, 0);
  const totalYearsExperience = totalMonths > 0 ? (Math.round((totalMonths / 12) * 10) / 10).toString() : null;

  let highestDegreeLevel: string | null = null;
  let highestDegreeField: string | null = null;
  let highestRank = 0;

  for (const entry of profile.education?.entries || []) {
    const normLevel = entry.degree_level?.normalized;
    const rank = normLevel ? DEGREE_RANKS[normLevel] || 0 : 0;
    if (rank > highestRank) {
      highestRank = rank;
      highestDegreeLevel = normLevel;
      highestDegreeField = entry.field?.normalized || entry.field?.raw || null;
    }
  }

  const salaryNorm = profile.logistics?.salary_expectation?.normalized;
  const expectedSalaryMin = salaryNorm?.min != null ? String(salaryNorm.min) : null;
  const expectedSalaryMax = salaryNorm?.max != null ? String(salaryNorm.max) : null;
  const salaryCurrency = salaryNorm?.currency || null;

  const noticeNorm = profile.logistics?.notice_period?.normalized;
  let noticePeriodDays: number | null = null;
  if (noticeNorm?.value != null && noticeNorm.unit) {
    switch (noticeNorm.unit) {
      case "days":
        noticePeriodDays = noticeNorm.value;
        break;
      case "weeks":
        noticePeriodDays = noticeNorm.value * 7;
        break;
      case "months":
        noticePeriodDays = noticeNorm.value * 30;
        break;
      default:
        noticePeriodDays = noticeNorm.value;
    }
  }

  return {
    id: profile.id,
    appliedJobId: profile.applied_job_id || null,
    name: profile.identity.name,
    email: profile.identity.email || null,
    phone: profile.identity.phone || null,
    cnic: profile.identity.cnic || null,
    city: profile.identity.location?.normalized?.city || null,
    province: profile.identity.location?.normalized?.province || null,
    pdfUrl: profile.source_document.url || null,

    currentRoleTitle,
    currentCompany,
    totalYearsExperience,
    highestDegreeLevel,
    highestDegreeField,
    expectedSalaryMin,
    expectedSalaryMax,
    salaryCurrency,
    noticePeriodDays,

    sourceDocument: profile.source_document,
    identity: profile.identity,
    workHistory: profile.work_history,
    education: profile.education,
    skillsDemonstrated: profile.skills_demonstrated,
    skillsDeclared: profile.skills_declared,
    logistics: profile.logistics,
    extractionMetadata: profile.extraction_metadata,

    createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
    updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date(),
  };
}

// Maps relational Drizzle candidate table select row to domain ParsedCandidateProfile
export function candidateRowToProfile(row: CandidateRecord): ParsedCandidateProfile {
  return {
    id: row.id,
    applied_job_id: row.appliedJobId,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    source_document: row.sourceDocument,
    identity: row.identity,
    work_history: row.workHistory,
    education: row.education,
    skills_demonstrated: row.skillsDemonstrated,
    skills_declared: row.skillsDeclared,
    logistics: row.logistics,
    extraction_metadata: row.extractionMetadata,
  };
}
