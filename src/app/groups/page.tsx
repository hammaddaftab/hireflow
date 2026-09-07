export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GroupsExplorerView } from "@/features/groups/components/GroupsExplorerView";
import { jobsService } from "@/features/jobs";
import { candidatesService } from "@/features/candidates";
import { groupsService } from "@/features/groups/groupsService";
import { FEATURES } from "@/config/features";
import { ROUTES } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Candidate Groups Topology - HireFlow",
  description: "Interactive node graph of candidate groups with viewport navigation and dealbreaker clustering.",
};

export default async function GroupsPage() {
  if (!FEATURES.CANDIDATE_GROUPS) {
    redirect(ROUTES.REVIEW);
  }
  const jobs = await jobsService.getAllJobs();
  const activeJob = jobs[0] || (await jobsService.getJobById("job-sample-1"));

  const allCandidates = await candidatesService.getAllCandidates();
  const persistedGroups = activeJob ? await groupsService.getGroupsForJob(activeJob.id) : [];

  return (
    <GroupsExplorerView
      activeJob={activeJob}
      candidates={allCandidates}
      persistedGroups={persistedGroups}
    />
  );
}
