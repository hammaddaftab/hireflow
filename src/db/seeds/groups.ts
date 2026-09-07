// Persistent database seeder for candidate groups and subgroups
// Populates realistic candidate groupings with parent-child hierarchy

import { db, groups, candidateGroupMemberships, conn } from "@/db";

export async function seedGroups() {
  console.log("Seeding persistent groups and subgroups...");

  const jobId = "job-sample-1";

  // Group 1: Fast-Clear Candidates (Root group)
  const groupFastClear = {
    id: "grp_fast_clear",
    jobId,
    parentId: null,
    name: "Fast-Clear Tier",
    description: "Candidates meeting all knockout criteria: min experience, required skills, and budget.",
  };

  // Subgroup 1a: Immediate Interview (Child of Fast-Clear)
  const subgroupImmediate = {
    id: "grp_sub_immediate",
    jobId,
    parentId: groupFastClear.id,
    name: "Immediate Interview",
    description: "Candidates ready for technical round scheduling with 0 negotiation or notice flags.",
  };

  // Group 2: Under Review (Root group)
  const groupUnderReview = {
    id: "grp_under_review",
    jobId,
    parentId: null,
    name: "Under Review / Negotiation",
    description: "High-potential candidates requiring compensation, notice period, or location alignment.",
  };

  // Subgroup 2a: Comp & Notice Exceptions (Child of Under Review)
  const subgroupLogistics = {
    id: "grp_sub_logistics",
    jobId,
    parentId: groupUnderReview.id,
    name: "Logistics Exceptions",
    description: "Salary expectation above standard band or notice duration > 30 days.",
  };

  // Group 3: Core Full Stack Match (Root group)
  const groupFullStack = {
    id: "grp_full_stack_core",
    jobId,
    parentId: null,
    name: "Full Stack Core (TS & React)",
    description: "Candidates with proven demonstrated TypeScript, React, and Node.js production experience.",
  };

  const allGroups = [
    groupFastClear,
    subgroupImmediate,
    groupUnderReview,
    subgroupLogistics,
    groupFullStack,
  ];

  for (const g of allGroups) {
    await db
      .insert(groups)
      .values({
        id: g.id,
        jobId: g.jobId,
        parentId: g.parentId,
        name: g.name,
        description: g.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // Define candidate memberships
  const memberships = [
    // Fast-Clear
    { groupId: "grp_fast_clear", candidateId: "cand_hamza" },
    { groupId: "grp_fast_clear", candidateId: "cand_ayesha" },

    // Immediate Interview (Subgroup)
    { groupId: "grp_sub_immediate", candidateId: "cand_hamza" },

    // Under Review
    { groupId: "grp_under_review", candidateId: "cand_abdullah" },
    { groupId: "grp_under_review", candidateId: "cand_bilal" },
    { groupId: "grp_under_review", candidateId: "cand_jillani" },

    // Logistics Exceptions (Subgroup)
    { groupId: "grp_sub_logistics", candidateId: "cand_abdullah" },
    { groupId: "grp_sub_logistics", candidateId: "cand_bilal" },

    // Full Stack Core
    { groupId: "grp_full_stack_core", candidateId: "cand_hamza" },
    { groupId: "grp_full_stack_core", candidateId: "cand_jillani" },
    { groupId: "grp_full_stack_core", candidateId: "cand_zainab" },
  ];

  for (const m of memberships) {
    await db
      .insert(candidateGroupMemberships)
      .values({
        id: `cgm_${m.groupId}_${m.candidateId}`,
        groupId: m.groupId,
        candidateId: m.candidateId,
        addedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${allGroups.length} persistent groups and ${memberships.length} memberships successfully.`);
}

// Standalone execution support
if (process.argv[1]?.includes("groups.ts") || process.argv[1]?.endsWith("groups")) {
  seedGroups()
    .then(() => conn.end())
    .catch((err) => {
      console.error("Groups seed failed:", err);
      process.exit(1);
    });
}
