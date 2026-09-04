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
