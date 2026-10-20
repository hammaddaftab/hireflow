export const dynamic = "force-dynamic";

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FEATURES } from "@/config/features";
import { EducationTestingWorkbench } from "@/features/evals/views/education/EducationTestingWorkbench";

export const metadata: Metadata = {
  title: "AI Education Extraction & Normalization - HireFlow",
  description:
    "Test direct AI education parsing and university normalization pipeline against pasted candidate CV text.",
};

export default function EducationEvalsPage() {
  if (!FEATURES.AI_EVALS) {
    notFound();
  }

  // Education extraction and normalization inspection workbench
  return <EducationTestingWorkbench />;
}
