import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import type {
  SkillRequirementItem,
  MinExperienceRequirement,
  EducationRequirement,
  LocationRequirement,
  WorkModeRequirement,
  CompensationBandRequirement,
  MaxNoticePeriodRequirement,
} from "./requirements";

export const jobs = pgTable("jobs", {
  id: varchar("id", { length: 128 }).primaryKey(),
  title: text("title").notNull(),
  seniorityLevel: text("seniority_level"),

  skillsRequired: jsonb("skills_required").$type<SkillRequirementItem[]>().notNull().default([]),
  skillsPreferred: jsonb("skills_preferred").$type<SkillRequirementItem[]>().notNull().default([]),

  minExperience: jsonb("min_experience").$type<MinExperienceRequirement>().notNull(),
  educationMin: jsonb("education_min").$type<EducationRequirement>().notNull(),
  location: jsonb("location").$type<LocationRequirement>().notNull(),
  workMode: jsonb("work_mode").$type<WorkModeRequirement>().notNull(),
  compensationBand: jsonb("compensation_band").$type<CompensationBandRequirement>().notNull(),
  maxNoticePeriod: jsonb("max_notice_period").$type<MaxNoticePeriodRequirement>().notNull(),

  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type JobRecord = typeof jobs.$inferSelect;
export type NewJobRecord = typeof jobs.$inferInsert;

