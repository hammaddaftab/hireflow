export const dynamic = "force-dynamic";

import React from "react";
import { jobsService } from "@/features/jobs";
import { candidatesService } from "@/services/candidatesService";
import { buildReviewQueue, reviewsService } from "@/features/review";
import { ReviewQueuePage } from "@/features/review/views";
import { groupsService } from "@/features/groups/groupsService";

import type { QueueFilterTab } from "@/entities/review";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams?: Promise<{
    candidateIndex?: string;
    tab?: string;
    city?: string;
    university?: string;
    group?: string;
  }>;
}) {
  const params = searchParams ? await searchParams : {};
  const jobs = await jobsService.getAllJobs();
  const activeJob = jobs[0] || (await jobsService.getJobById("job-sample-1"));

  if (!activeJob) {
    return (
      <div className="p-8 text-center text-on-surface">
        No active job position found to review.
      </div>
    );
  }

  // Parallelize independent database queries to eliminate waterfalls
  const [allCandidates, priorDecisions, persistedGroups] = await Promise.all([
    candidatesService.getAllCandidates(),
    reviewsService.getDecisionsForJob(activeJob.id),
    groupsService.getGroupsForJob(activeJob.id),
  ]);
  const queue = buildReviewQueue(allCandidates, activeJob, priorDecisions);

  const initialIndex = params.candidateIndex ? parseInt(params.candidateIndex, 10) : 0;

  return (
    <ReviewQueuePage
      initialJob={activeJob}
      initialQueue={queue}
      initialPersistedGroups={persistedGroups}
      initialIndex={isNaN(initialIndex) ? 0 : initialIndex}
      initialTab={(params.tab as QueueFilterTab) || "all"}
      initialCity={params.city || null}
      initialUniversity={params.university || null}
      initialGroupId={params.group || null}
    />
  );
}
