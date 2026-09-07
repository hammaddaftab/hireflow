// Entity and Drizzle ORM schema for persisted candidate groups and subgroups

import { pgTable, text, timestamp, varchar, uniqueIndex, type AnyPgColumn } from "drizzle-orm/pg-core";
import { jobs } from "./job";
import { candidates } from "./candidate";

export const groups = pgTable(
  "groups",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    jobId: varchar("job_id", { length: 128 }).references(() => jobs.id, { onDelete: "cascade" }),
    parentId: varchar("parent_id", { length: 128 }).references((): AnyPgColumn => groups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  }
);

export const candidateGroupMemberships = pgTable(
  "candidate_group_memberships",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    groupId: varchar("group_id", { length: 128 })
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    candidateId: varchar("candidate_id", { length: 128 })
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("candidate_group_unique").on(table.groupId, table.candidateId),
  ]
);

export type GroupRecord = typeof groups.$inferSelect;
export type NewGroupRecord = typeof groups.$inferInsert;

export type CandidateGroupMembershipRecord = typeof candidateGroupMemberships.$inferSelect;
export type NewCandidateGroupMembershipRecord = typeof candidateGroupMemberships.$inferInsert;
