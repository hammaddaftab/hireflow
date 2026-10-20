export const dynamic = "force-dynamic";

import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FEATURES } from "@/config/features";
import { NormalizationLabWorkbench } from "@/features/evals/views/normalization/NormalizationLabWorkbench";

export const metadata: Metadata = {
  title: "Entity Normalization Lab - HireFlow",
  description:
    "Test isolated university and degree string normalization against the in-memory catalog.",
};

export default function NormalizationEvalsPage() {
  if (!FEATURES.AI_EVALS) {
    notFound();
  }

  // Standalone normalization testing workbench
  return <NormalizationLabWorkbench />;
}
