export const dynamic = "force-dynamic";

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FEATURES } from "@/config/features";
import { PdfTextExtractorWorkbench } from "@/features/evals/views/pdf-extract/PdfTextExtractorWorkbench";

export const metadata: Metadata = {
  title: "PDF Text Extraction - HireFlow",
  description:
    "Upload PDF resumes or documents and extract raw text using the poppler extraction engine.",
};

export default function PdfExtractEvalsPage() {
  if (!FEATURES.AI_EVALS) {
    notFound();
  }

  // Standalone PDF text extraction workbench
  return <PdfTextExtractorWorkbench />;
}
