export const dynamic = "force-dynamic";

import React from "react";
import { jobsService } from "@/features/jobs";
import { candidatesService } from "@/features/candidates";
import { buildReviewQueue, FocusReviewPage, reviewsService } from "@/features/review";
import { groupsService } from "@/features/groups/groupsService";
import type { QueueFilterTab } from "@/entities/review";

export default async function FocusRoutePage({
  searchParams,
}: {
  searchParams: Promise<{
    candidateIndex?: string;
    tab?: string;
    city?: string;
    group?: string;
  }>;
}) {
  const params = await searchParams;
  const jobs = await jobsService.getAllJobs();
  const activeJob = jobs[0] || (await jobsService.getJobById("job-sample-1"));

  if (!activeJob) {
    return (
      <div className="p-8 text-center text-on-surface">
        No active job position found to review.
      </div>
    );
  }

  const allCandidates = await candidatesService.getAllCandidates();
  const priorDecisions = await reviewsService.getDecisionsForJob(activeJob.id);
  const persistedGroups = await groupsService.getGroupsForJob(activeJob.id);
  const queue = buildReviewQueue(allCandidates, activeJob, priorDecisions);

  const initialIndex = params.candidateIndex ? parseInt(params.candidateIndex, 10) : 0;

  return (
    <FocusReviewPage
      initialJob={activeJob}
      initialQueue={queue}
      initialPersistedGroups={persistedGroups}
      initialIndex={isNaN(initialIndex) ? 0 : initialIndex}
      initialTab={(params.tab as QueueFilterTab) || "all"}
      initialCity={params.city || null}
      initialGroupId={params.group || null}
    />
  );
}
