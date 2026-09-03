export const dynamic = "force-dynamic";

import React from "react";
import { jobsService } from "@/features/jobs";
import { candidatesService } from "@/features/candidates";
import { buildReviewQueue, ReviewQueuePage } from "@/features/review";

export default async function ReviewPage() {
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
  const queue = buildReviewQueue(allCandidates, activeJob);

  return <ReviewQueuePage initialJob={activeJob} initialQueue={queue} />;
}
