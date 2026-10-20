export const dynamic = "force-dynamic";

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FEATURES } from "@/config/features";
import { IdentityTestingWorkbench } from "@/features/evals/views/identity/IdentityTestingWorkbench";

export const metadata: Metadata = {
  title: "AI Identity Extraction & Normalization - HireFlow",
  description:
    "Test direct candidate identity parsing, contact extraction, geographic normalization, and portfolio links.",
};

export default function IdentityEvalsPage() {
  if (!FEATURES.AI_EVALS) {
    notFound();
  }

  // Candidate identity extraction and normalization inspection workbench
  return <IdentityTestingWorkbench />;
}
