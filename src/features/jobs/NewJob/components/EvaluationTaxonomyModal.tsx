"use client";

import React, { useState } from "react";
import { OverlayContainer } from "@/components/ui/OverlayContainer";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { FileText, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";

export interface EvaluationTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EvaluationTaxonomyModal({ isOpen, onClose }: EvaluationTaxonomyModalProps) {
  const [activeTab, setActiveTab] = useState<"stages" | "taxonomy">("stages");

  return (
    <OverlayContainer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Candidate Screening Mechanics"
      description="Transparent 3-stage pipeline evaluation and the 6-state verification taxonomy."
      footer={
        <div className="w-full flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("stages")}
              disabled={activeTab === "stages"}
              className="text-xs"
            >
              Previous
            </Button>
          </div>

          {/* Centered Pagination Dots */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("stages")}
              aria-label="View 1: Core Pipeline Stages"
              className={`transition-all rounded-full cursor-pointer ${
                activeTab === "stages"
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-outline hover:bg-on-surface-variant"
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveTab("taxonomy")}
              aria-label="View 2: 6-State Evaluation Taxonomy"
              className={`transition-all rounded-full cursor-pointer ${
                activeTab === "taxonomy"
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-outline hover:bg-on-surface-variant"
              }`}
            />
          </div>

          <div>
            {activeTab === "stages" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("taxonomy")}
                className="text-xs"
              >
                Next: 6-State Taxonomy
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Tab Switcher */}
        <div className="flex border-b border-outline-variant">
          <button
            type="button"
            onClick={() => setActiveTab("stages")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "stages"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            1. Core Pipeline Overview (3 Stages)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("taxonomy")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "taxonomy"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            2. 6-State Evaluation Taxonomy (Deep Dive)
          </button>
        </div>

        {/* VIEW 1: Core Pipeline Overview (3 Stages) */}
        {activeTab === "stages" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Typography variant="body-small" className="text-on-surface-variant font-normal">
              HireFlow processes every candidate through a strict, transparent sequential pipeline. Hard dealbreakers deterministically filter candidates before soft preference scoring is computed.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage 1 */}
              <div className="rounded-lg border border-outline-variant bg-surface-container p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Stage 1</span>
                    <FileText className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <Typography variant="title-small" as="h4" className="text-on-surface">
                    Document Ingestion & Health
                  </Typography>
                  <Typography variant="body-small" className="text-on-surface-variant mt-2 font-normal">
                    Validates scan readability and OCR integrity. Corrupted files or failed extractions are classified as <strong className="text-on-surface font-semibold">Unparseable</strong> document issues—never penalized as unqualified candidates.
                  </Typography>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant text-[11px] font-medium text-on-surface-variant">
                  Output: Structured Text or Document Defect Flag
                </div>
              </div>

              {/* Stage 2 */}
              <div className="rounded-lg border border-outline-variant bg-surface-container p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Stage 2</span>
                    <ShieldAlert className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <Typography variant="title-small" as="h4" className="text-on-surface">
                    Deterministic Hard Knockouts
                  </Typography>
                  <Typography variant="body-small" className="text-on-surface-variant mt-2 font-normal">
                    Checks dealbreaker rules (e.g. min years, mandatory skills). If any required criterion is violated or contradicted, candidate is marked as <strong className="text-on-surface font-semibold">Knocked Out</strong> with exact rationale.
                  </Typography>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant text-[11px] font-medium text-on-surface-variant">
                  Output: Binary Dealbreaker Status (Pass / Fail)
                </div>
              </div>

              {/* Stage 3 */}
              <div className="rounded-lg border border-outline-variant bg-surface-container p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Stage 3</span>
                    <Sparkles className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <Typography variant="title-small" as="h4" className="text-on-surface">
                    Weighted Soft Scoring
                  </Typography>
                  <Typography variant="body-small" className="text-on-surface-variant mt-2 font-normal">
                    Calculates bonus match points for preferred skills and credentials based on weight multipliers (1-5x). Missing soft criteria lowers the score but never causes automatic rejection.
                  </Typography>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant text-[11px] font-medium text-on-surface-variant">
                  Output: Weighted Match Score (0 - 100%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 6-State Evaluation Taxonomy (Deep Dive) */}
        {activeTab === "taxonomy" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <Typography variant="body-small" className="text-on-surface-variant font-normal">
              Every requirement evaluated by HireFlow produces one of six exhaustive states, strictly divided into Content-Level facts (what the resume states) and System-Level integrity (pipeline health).
            </Typography>

            {/* Category A: Content-Level Facts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Typography variant="title-small" as="h4" className="text-on-surface">
                  Content-Level (Resume Facts)
                </Typography>
                <span className="rounded-full bg-surface-container-highest text-on-surface px-2.5 py-0.5 text-xs font-semibold">
                  5 Content States
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Confirmed */}
                <div className="rounded-lg border border-outline-variant bg-surface-container p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-on-surface">1. Confirmed</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-normal leading-relaxed">
                    Explicitly stated in resume text with clear verification (e.g., &quot;5 years of Python engineering&quot;).
                  </p>
                </div>

                {/* 2. Inferred */}
                <div className="rounded-lg border border-outline-variant bg-surface-container p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-on-surface">2. Inferred</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-normal leading-relaxed">
                    Computed logically from stated timeline dates, job titles, or related domain context rather than a direct mention.
                  </p>
                </div>

                {/* 3. Contradicted */}
                <div className="rounded-lg border border-outline-variant bg-surface-container p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="text-xs font-bold text-on-surface">3. Contradicted</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-normal leading-relaxed">
                    Resume contradicts itself (e.g. conflicting dates for same role) or directly violates criteria (e.g. requiring onsite when candidate specifies remote only).
                  </p>
                </div>

                {/* 4. Not Stated */}
                <div className="rounded-lg border border-outline-variant bg-surface-container p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <span className="text-xs font-bold text-on-surface">4. Not Stated</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-normal leading-relaxed">
                    Resume text does not mention this criterion. Represents absence of statement—never assumed as proof of disqualification on soft criteria.
                  </p>
                </div>

                {/* 5. Ambiguous */}
                <div className="rounded-lg border border-outline-variant bg-surface-container p-3 space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-on-surface">5. Ambiguous</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-normal leading-relaxed">
                    Mentioned in passing without depth or quantifiable metrics (e.g., &quot;familiar with Kubernetes and distributed systems&quot;). Flagged for recruiter interview probing.
                  </p>
                </div>
              </div>
            </div>

            {/* Category B: System-Level Integrity */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <Typography variant="title-small" as="h4" className="text-on-surface">
                  System-Level (Pipeline Integrity)
                </Typography>
                <span className="rounded-full bg-surface-container-highest text-on-surface px-2.5 py-0.5 text-xs font-semibold">
                  Document Defect
                </span>
              </div>

              <div className="rounded-lg border border-outline-variant bg-surface-container p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-on-surface">6. Unparseable</span>
                </div>
                <p className="text-xs text-on-surface-variant font-normal leading-relaxed">
                  Triggered when a document scan is unreadable, corrupted, or OCR text extraction fails. This is strictly recorded as a <strong className="text-on-surface font-semibold">document pipeline defect</strong> rather than a candidate disqualification, preventing false rejections.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </OverlayContainer>
  );
}
