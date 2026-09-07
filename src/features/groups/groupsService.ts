// Service for managing persisted candidate groups and subgroups in PostgreSQL via Drizzle ORM

import { db, groups, candidateGroupMemberships } from "@/db";
import { eq, desc, inArray } from "drizzle-orm";
import type { PersistedGroupWithMembers } from "./types";

export type { PersistedGroupWithMembers };

export interface CreateGroupInput {
  id?: string;
  jobId?: string;
  name: string;
  description?: string;
  parentId?: string | null;
  candidateIds?: string[];
}

export async function createGroup(
  input: CreateGroupInput
): Promise<PersistedGroupWithMembers> {
  const groupId = input.id || `grp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const [createdGroup] = await db
    .insert(groups)
    .values({
      id: groupId,
      jobId: input.jobId || null,
      parentId: input.parentId || null,
      name: input.name,
      description: input.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const candidateIds = input.candidateIds || [];
  if (candidateIds.length > 0) {
    const membershipRows = candidateIds.map((candId) => ({
      id: `cgm_${groupId}_${candId}`,
      groupId,
      candidateId: candId,
      addedAt: new Date(),
    }));

    await db
      .insert(candidateGroupMemberships)
      .values(membershipRows)
      .onConflictDoNothing();
  }

  return {
    ...createdGroup,
    candidateIds,
    childrenCount: 0,
  };
}

export async function getGroupsForJob(
  jobId: string
): Promise<PersistedGroupWithMembers[]> {
  const allGroups = await db
    .select()
    .from(groups)
    .where(eq(groups.jobId, jobId))
    .orderBy(desc(groups.createdAt));

  if (allGroups.length === 0) {
    return [];
  }

  const groupIds = allGroups.map((g) => g.id);
  const memberships = await db
    .select({
      groupId: candidateGroupMemberships.groupId,
      candidateId: candidateGroupMemberships.candidateId,
    })
    .from(candidateGroupMemberships)
    .where(inArray(candidateGroupMemberships.groupId, groupIds));

  const membershipsByGroupId = new Map<string, string[]>();
  for (const m of memberships) {
    const list = membershipsByGroupId.get(m.groupId) || [];
    list.push(m.candidateId);
    membershipsByGroupId.set(m.groupId, list);
  }

  const childrenCounts = new Map<string, number>();
  for (const g of allGroups) {
    if (g.parentId) {
      childrenCounts.set(g.parentId, (childrenCounts.get(g.parentId) || 0) + 1);
    }
  }

  return allGroups.map((g) => ({
    ...g,
    candidateIds: membershipsByGroupId.get(g.id) || [],
    childrenCount: childrenCounts.get(g.id) || 0,
  }));
}

export async function getGroupById(
  groupId: string
): Promise<PersistedGroupWithMembers | null> {
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);

  if (!group) {
    return null;
  }

  const memberships = await db
    .select({ candidateId: candidateGroupMemberships.candidateId })
    .from(candidateGroupMemberships)
    .where(eq(candidateGroupMemberships.groupId, groupId));

  const children = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.parentId, groupId));

  return {
    ...group,
    candidateIds: memberships.map((m) => m.candidateId),
    childrenCount: children.length,
  };
}

export async function addCandidatesToGroup(
  groupId: string,
  candidateIds: string[]
): Promise<void> {
  if (candidateIds.length === 0) return;

  const rows = candidateIds.map((candId) => ({
    id: `cgm_${groupId}_${candId}`,
    groupId,
    candidateId: candId,
    addedAt: new Date(),
  }));

  await db
    .insert(candidateGroupMemberships)
    .values(rows)
    .onConflictDoNothing();
}

export const groupsService = {
  createGroup,
  getGroupsForJob,
  getGroupById,
  addCandidatesToGroup,
};
