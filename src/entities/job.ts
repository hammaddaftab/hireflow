import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import type {
  SkillRequirementItem,
  MinExperienceRequirement,
  EducationRequirement,
  LocationRequirement,
  WorkModeRequirement,
  CompensationBandRequirement,
  MaxNoticePeriodRequirement,
  DegreeLevel,
} from "./extraction/job/requirements";

export const jobs = pgTable("jobs", {
  id: varchar("id", { length: 128 }).primaryKey(),
  title: text("title").notNull(),
  department: text("department"),
  location: text("location"),
  employmentType: varchar("employment_type", { length: 32 }),
  description: text("description"),
  seniority_level: text("seniority_level"),

  skills_required: jsonb("skills_required").$type<SkillRequirementItem[]>().notNull().default([]),
  skills_preferred: jsonb("skills_preferred").$type<SkillRequirementItem[]>().notNull().default([]),

  min_experience: jsonb("min_experience").$type<MinExperienceRequirement>().notNull(),
  education_min: jsonb("education_min").$type<EducationRequirement>().notNull(),
  location_requirement: jsonb("location_requirement").$type<LocationRequirement>().notNull(),
  work_mode: jsonb("work_mode").$type<WorkModeRequirement>().notNull(),
  compensation_band: jsonb("compensation_band").$type<CompensationBandRequirement>().notNull(),
  max_notice_period: jsonb("max_notice_period").$type<MaxNoticePeriodRequirement>().notNull(),

  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type JobRecord = Job;
export type NewJobRecord = NewJob;

export type {
  SkillRequirementItem,
  MinExperienceRequirement,
  EducationRequirement,
  LocationRequirement,
  WorkModeRequirement,
  CompensationBandRequirement,
  MaxNoticePeriodRequirement,
  DegreeLevel,
};
