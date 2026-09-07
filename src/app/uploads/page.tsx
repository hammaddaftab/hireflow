export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import { UploadsPage } from "@/features/uploads";
import { uploadsService } from "@/services/uploadsService";
import { jobService } from "@/features/jobs";

export const metadata: Metadata = {
  title: "Resume Uploads - HireFlow",
  description: "Candidate resume documents stored in Vercel Blob Storage, staged for Step 2 LLM extraction.",
};

export default async function UploadsRoute() {
  const uploads = await uploadsService.getAll();
  const jobs = await jobService.getAllJobs();
  const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <UploadsPage
      initialUploads={uploads}
      initialJobs={jobs}
      isBlobConfigured={isBlobConfigured}
    />
  );
}
