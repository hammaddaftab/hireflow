export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FEATURES } from "@/config/features";
import { StressTestWorkbench } from "@/features/evals/components/StressTestWorkbench";

export const metadata: Metadata = {
  title: "AI Experience Extraction Stress Test - HireFlow",
  description:
    "Stress test OpenAI work history parsing accuracy, date arithmetic, and employment-type classification against ground-truth fixtures.",
};

export default function ExperienceEvalsPage() {
  if (!FEATURES.AI_EVALS) {
    notFound();
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-16 space-y-6">
      {/* Top Breadcrumb & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/review"
            className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Review Queue</span>
          </Link>
          <span className="text-on-surface-variant/40">•</span>
          <span className="text-xs uppercase font-mono text-primary font-semibold">
            Accuracy & Reliability Benchmarks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/uploads/sandbox">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl text-xs gap-1.5 font-semibold"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Upload Sandbox</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Interactive Workbench */}
      <StressTestWorkbench />
    </div>
  );
}
