"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OverlayContainer } from "@/components/ui/OverlayContainer";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import {
  FileText,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  UploadCloud,
  Cpu,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";

export interface EvaluationTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "stages" | "uploads" | "taxonomy";

// Explains screening pipeline mechanics, independent /uploads staging, and verification taxonomy
export function EvaluationTaxonomyModal({ isOpen, onClose }: EvaluationTaxonomyModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("stages");

  const tabOrder: TabKey[] = ["stages", "uploads", "taxonomy"];
  const currentIndex = tabOrder.indexOf(activeTab);

  const handleNext = () => {
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  return (
    <OverlayContainer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Candidate Screening Mechanics"
      description="3-stage evaluation pipeline, independent resume uploads staging, and verification taxonomy."
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="text-xs cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === tabOrder.length - 1}
              className="text-xs cursor-pointer"
            >
              Next
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Tab Switcher */}
        <div className="flex border-b border-outline-variant/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("stages")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "stages"
                ? "border-on-surface text-on-surface font-bold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            1. Core Pipeline Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("uploads")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "uploads"
                ? "border-on-surface text-on-surface font-bold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            2. Independent Uploads Hub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("taxonomy")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "taxonomy"
                ? "border-on-surface text-on-surface font-bold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            3. Verification Taxonomy
          </button>
        </div>

        {/* VIEW 1: Core Pipeline Overview (3 Stages) */}
        {activeTab === "stages" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Typography variant="body-medium" className="text-on-surface-variant leading-relaxed">
              HireFlow processes every applicant through an automated 3-stage evaluation sequence. Resumes can enter the pipeline either via the independent uploads hub or via direct drag-and-drop in the triage queue. Dealbreaker criteria deterministically filter candidates before soft preference scoring is computed.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage 1 */}
              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-mono">Stage 1</span>
                  <FileText className="h-4 w-4 text-on-surface-variant" />
                </div>
                <Typography variant="title-small" as="h4" className="text-on-surface">
                  Ingestion & Extraction
                </Typography>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  Resumes enter via the independent uploads hub or live queue drop. Sequential extraction parses structured aspects including identity, work history, education, skills, and logistics. Unreadable scans trigger an unparseable document flag rather than penalizing candidate qualifications.
                </Typography>
              </div>

              {/* Stage 2 */}
              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-mono">Stage 2</span>
                  <ShieldAlert className="h-4 w-4 text-on-surface-variant" />
                </div>
                <Typography variant="title-small" as="h4" className="text-on-surface">
                  Deterministic Dealbreakers
                </Typography>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  Evaluates the dealbreaker criteria configured in this form, such as minimum experience duration, mandatory skills, notice period, and budget ceiling. If any required criterion is violated or contradicted, the candidate is flagged with verifiable evidence spans.
                </Typography>
              </div>

              {/* Stage 3 */}
              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-on-surface-variant font-mono">Stage 3</span>
                  <Sparkles className="h-4 w-4 text-on-surface-variant" />
                </div>
                <Typography variant="title-small" as="h4" className="text-on-surface">
                  Soft Scoring & Triage
                </Typography>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  Calculates bonus points for preferred skills and credentials. Candidates with all dealbreakers confirmed advance to top review priority, followed by second look candidates and contradicted cards in the review queue.
                </Typography>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Independent Uploads Hub */}
        {activeTab === "uploads" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Typography variant="body-medium" className="text-on-surface-variant leading-relaxed">
              HireFlow provides a dedicated uploads hub designed for independent, batch resume ingestion and deep extraction prior to or alongside specific job requirement schemas.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Feature 1: Standalone Staging & Cloud Storage */}
              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-on-surface-variant shrink-0" />
                  <span className="text-xs font-bold text-on-surface">Cloud Document Staging</span>
                </div>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  Resumes uploaded to the uploads hub are stored securely in cloud storage with deduplication. They can be parsed independently of an active job and retained as reusable candidate profiles.
                </Typography>
              </div>

              {/* Feature 2: Sequential Aspect Extraction */}
              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-on-surface-variant shrink-0" />
                  <span className="text-xs font-bold text-on-surface">Sequential Aspect Extraction</span>
                </div>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  Extracts structured domain aspects: identity, work history, education, demonstrated skills with concrete actions and outcomes, declared skills, and logistics including salary expectations and notice period.
                </Typography>
              </div>

              {/* Feature 3: Live Ingestion Feedback Deck */}
              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-on-surface-variant shrink-0" />
                  <span className="text-xs font-bold text-on-surface">Real-Time Feedback Deck</span>
                </div>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  During ingestion, the feedback deck provides live telemetry: file parsing progress, extracted candidate profile previews, aspect counts, and instant defect alerts if a scan is unreadable or corrupted.
                </Typography>
              </div>

              {/* Feature 4: Criteria Matching Against Current Job */}
              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-on-surface-variant shrink-0" />
                  <span className="text-xs font-bold text-on-surface">Dynamic Criteria Matching</span>
                </div>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  Once candidate profiles are extracted in the uploads hub, they can be evaluated against the criteria configured in this form, instantly populating the job triage queue with dealbreaker determinations.
                </Typography>
              </div>
            </div>

            {/* Ingestion Hub Link Callout */}
            <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="h-4 w-4 text-on-surface-variant shrink-0" />
                <Typography variant="body-small" className="text-on-surface-variant">
                  Need to stage or inspect resumes independently? Access the dedicated uploads hub.
                </Typography>
              </div>
              <Link
                href="/uploads"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface text-xs font-medium hover:bg-surface-container-highest transition-colors shrink-0"
              >
                <span>Open Uploads Hub</span>
                <ArrowRight className="h-3 w-3 text-on-surface-variant" />
              </Link>
            </div>
          </div>
        )}

        {/* VIEW 3: Verification Taxonomy */}
        {activeTab === "taxonomy" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <Typography variant="body-medium" className="text-on-surface-variant leading-relaxed">
              Every requirement evaluated against a candidate profile produces one of six exhaustive states, divided into content-level facts and system-level integrity.
            </Typography>

            {/* Category A: Content-Level Facts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Typography variant="title-small" as="h4" className="text-on-surface">
                  Content-Level (Resume Facts)
                </Typography>
                <span className="rounded-full bg-surface-container-highest text-on-surface-variant px-2.5 py-0.5 text-xs font-mono">
                  5 Content States
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Confirmed */}
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <span className="text-xs font-bold text-on-surface">1. Confirmed</span>
                  </div>
                  <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                    Explicitly stated in resume text with clear verification, such as verified years of experience in a required role.
                  </Typography>
                </div>

                {/* 2. Inferred */}
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <span className="text-xs font-bold text-on-surface">2. Inferred</span>
                  </div>
                  <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                    Computed logically from verified work history dates, job titles, or related domain context rather than a single explicit sentence.
                  </Typography>
                </div>

                {/* 3. Contradicted */}
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <span className="text-xs font-bold text-on-surface">3. Contradicted</span>
                  </div>
                  <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                    Resume violates criteria, such as salary expectations exceeding the budget ceiling or location conflicting with onsite requirements.
                  </Typography>
                </div>

                {/* 4. Not Stated */}
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <span className="text-xs font-bold text-on-surface">4. Not Stated</span>
                  </div>
                  <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                    Resume text does not mention this criterion. Represents absence of statement and is never assumed as automatic disqualification on soft criteria.
                  </Typography>
                </div>

                {/* 5. Ambiguous */}
                <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3 space-y-1.5 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-on-surface-variant shrink-0" />
                    <span className="text-xs font-bold text-on-surface">5. Ambiguous</span>
                  </div>
                  <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                    Mentioned in passing without depth or quantifiable metrics. Flagged for recruiter interview follow-up.
                  </Typography>
                </div>
              </div>
            </div>

            {/* Category B: System-Level Integrity */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <Typography variant="title-small" as="h4" className="text-on-surface">
                  System-Level (Pipeline Integrity)
                </Typography>
                <span className="rounded-full bg-surface-container-highest text-on-surface-variant px-2.5 py-0.5 text-xs font-mono">
                  Document Defect
                </span>
              </div>

              <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-on-surface-variant shrink-0" />
                  <span className="text-xs font-bold text-on-surface">6. Unparseable</span>
                </div>
                <Typography variant="body-small" className="text-on-surface-variant leading-relaxed">
                  Triggered when a document scan is unreadable, corrupted, or text extraction fails. This is recorded as a document pipeline defect rather than candidate disqualification.
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>
    </OverlayContainer>
  );
}
