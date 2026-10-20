export const dynamic = "force-dynamic";

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FEATURES } from "@/config/features";
import { StressTestWorkbench } from "@/features/evals/views/experience/StressTestWorkbench";

export const metadata: Metadata = {
  title: "AI Experience Extraction Stress Test - HireFlow",
  description:
    "Stress test OpenAI work history parsing accuracy, date arithmetic, and employment-type classification against ground-truth fixtures.",
};

export default function ExperienceEvalsPage() {
  if (!FEATURES.AI_EVALS) {
    notFound();
  }

  // Work experience extraction stress test workbench
  return <StressTestWorkbench />;
}

