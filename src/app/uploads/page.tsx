export const dynamic = "force-dynamic";

import React from "react";
import type { Metadata } from "next";
import { UploadsPage } from "@/features/uploads";
import { uploadsService } from "@/services/uploadsService";

export const metadata: Metadata = {
  title: "Resume Uploads - HireFlow",
  description: "Candidate resume documents stored in Vercel Blob Storage, staged for Step 2 LLM extraction.",
};

export default async function UploadsRoute() {
  const uploads = await uploadsService.getAll();
  const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <UploadsPage
      initialUploads={uploads}
      isBlobConfigured={isBlobConfigured}
    />
  );
}
