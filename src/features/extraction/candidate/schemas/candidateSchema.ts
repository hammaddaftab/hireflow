import { pgTable, text, timestamp, varchar, jsonb, numeric, integer } from "drizzle-orm/pg-core";
import { jobs } from "@/features/extraction/job/schema";
import type { IdentityExtraction } from "../aspects/identity";
import type { WorkHistoryExtraction } from "../aspects/workHistory";
import type { EducationExtraction } from "../aspects/education";
import type { SkillsDemonstratedExtraction } from "../aspects/skillsDemonstrated";
import type { SkillsDeclaredExtraction } from "../aspects/skillsDeclared";
import type { LogisticsExtraction } from "../aspects/logistics";
import type { ExtractionMetadata } from "../aspects/extractionMetadata";

export interface SourceDocumentMetadata {
  filename: string;
  file_size_bytes?: number;
  mime_type: string;
  url?: string;
}

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

