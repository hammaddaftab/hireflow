"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Building2,
  MapPin,
  GraduationCap,
  FileText,
  ArrowRight,
  Sparkles,
  Check,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import type { Job } from "@/entities/job";
import type { UploadedResumeRecord } from "@/lib/upload";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { CandidateReviewItem } from "@/features/review/types";
import { buildReviewQueue } from "@/features/review/core/services/reviewQueueService";

export interface ResumeIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploads: UploadedResumeRecord[];
  jobs: Job[];
  initialJobId?: string;
  onExtractionComplete: () => void;
}

// Spring physics matching Fedora/GNOME spatial deck
const STACK_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.85,
} as const;

export function ResumeIngestionModal({
  isOpen,
  onClose,
  uploads,
  jobs,
  initialJobId,
  onExtractionComplete,
}: ResumeIngestionModalProps) {
  // Job selection
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId || jobs[0]?.id || "job-sample-1"
  );

  // Filter selectable uploads: default to unlinked uploads, or all if none unlinked
  const unlinkedUploads = useMemo(() => {
    return uploads.filter((u) => !u.jobId);
  }, [uploads]);

  const defaultUploadIds = useMemo(() => {
    const list = unlinkedUploads.length > 0 ? unlinkedUploads : uploads;
    return list.map((u) => u.id);
  }, [unlinkedUploads, uploads]);

  const [selectedUploadIds, setSelectedUploadIds] = useState<string[]>(defaultUploadIds);

  // Extraction workflow state
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentExtractingIndex, setCurrentExtractingIndex] = useState<number>(-1);
  const [currentFilename, setCurrentFilename] = useState<string>("");
  const [extractedCandidates, setExtractedCandidates] = useState<ParsedCandidateProfile[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selected uploads when modal opens
  useEffect(() => {
    if (isOpen) {
      const list = unlinkedUploads.length > 0 ? unlinkedUploads : uploads;
      setSelectedUploadIds(list.map((u) => u.id));
      setIsExtracting(false);
      setIsFinished(false);
      setExtractedCandidates([]);
      setCurrentExtractingIndex(-1);
      setActiveCardIndex(0);
      setErrorMessage(null);
    }
  }, [isOpen, unlinkedUploads, uploads]);

  // Selected job entity
  const currentJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  // Evaluated candidate review items
  const candidateReviewItems: CandidateReviewItem[] = useMemo(() => {
    if (!currentJob || extractedCandidates.length === 0) return [];
    return buildReviewQueue(extractedCandidates, currentJob);
  }, [extractedCandidates, currentJob]);

  // Toggle selection for a specific upload
  const toggleUploadSelection = (id: string) => {
    if (isExtracting) return;
    setSelectedUploadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Keyboard navigation for stacked cards
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExtracting) {
        onClose();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setActiveCardIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setActiveCardIndex((prev) =>
          Math.min(candidateReviewItems.length - 1, prev + 1)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExtracting, candidateReviewItems.length, onClose]);

  // Start sequential extraction
  const startExtraction = useCallback(async () => {
    if (selectedUploadIds.length === 0 || !selectedJobId) return;

    setIsExtracting(true);
    setIsFinished(false);
    setErrorMessage(null);
    setExtractedCandidates([]);

    const queuedUploads = uploads.filter((u) => selectedUploadIds.includes(u.id));

    for (let i = 0; i < queuedUploads.length; i++) {
      const upload = queuedUploads[i];
      setCurrentExtractingIndex(i);
      setCurrentFilename(upload.filename);

      try {
        const response = await fetch("/api/resumes/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId: upload.id,
            jobId: selectedJobId,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `Failed to extract ${upload.filename}`);
        }

        const data = await response.json();
        const candidate: ParsedCandidateProfile = data.data.candidate;

        // Append to list and move active focus to the newly arrived card
        setExtractedCandidates((prev) => {
          const updated = [...prev, candidate];
          setActiveCardIndex(updated.length - 1);
          return updated;
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(`Error extracting ${upload.filename}: ${msg}`);
      }
    }

    setIsExtracting(false);
    setIsFinished(true);
    setCurrentExtractingIndex(-1);
    onExtractionComplete();
  }, [selectedUploadIds, selectedJobId, uploads, onExtractionComplete]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => (!isExtracting ? onClose() : null)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden"
        style={{ height: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/40 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <Typography variant="title-medium" className="text-on-surface font-bold text-sm">
                Resume Ingestion & Candidate Extraction
              </Typography>
              <p className="text-[11px] text-on-surface-variant">
                Stage uploaded resumes into structured candidate profiles linked to an open position
              </p>
            </div>
          </div>

          {!isExtracting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 relative flex flex-col bg-surface-container-lowest overflow-hidden">
          {/* View 1: Job Selection and Ingestion Setup */}
          {!isExtracting && !isFinished && extractedCandidates.length === 0 && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Step 1: Select Target Job */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span>1. Select Target Job</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {jobs.map((job) => {
                    const isSelected = job.id === selectedJobId;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-outline-variant/60 bg-surface hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-on-surface truncate">
                              {job.title}
                            </h4>
                            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                              {job.department} • {job.location}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="h-5 w-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <Badge variant="neutral" className="text-[10px] py-0 px-2 font-mono uppercase">
                            {"mode" in job.work_mode && typeof job.work_mode.mode === "string"
                              ? job.work_mode.mode
                              : (job.employmentType || "Full-time")}
                          </Badge>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            ID: {job.id}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Resumes to Ingest */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>2. Select Uploaded Documents ({selectedUploadIds.length}/{uploads.length})</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUploadIds(uploads.map((u) => u.id))}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-on-surface-variant text-[11px]">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedUploadIds([])}
                      className="text-[11px] text-on-surface-variant hover:text-on-surface"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="border border-outline-variant/60 rounded-xl bg-surface divide-y divide-outline-variant/30 max-h-60 overflow-y-auto">
                  {uploads.map((upload) => {
                    const isSelected = selectedUploadIds.includes(upload.id);
                    return (
                      <div
                        key={upload.id}
                        onClick={() => toggleUploadSelection(upload.id)}
                        className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/5" : "hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-primary border-primary text-on-primary"
                                : "border-outline-variant bg-surface"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-on-surface truncate block">
                              {upload.filename}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              {(upload.size / 1024).toFixed(1)} KB • {upload.contentType}
                            </span>
                          </div>
                        </div>

                        {upload.jobId && (
                          <Badge variant="neutral" className="text-[10px] py-0 px-1.5 font-mono">
                            Linked: {upload.jobId}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* View 2: Live Extraction & Stacked Cards Deck */}
          {(isExtracting || isFinished || extractedCandidates.length > 0) && (
            <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
              {/* Extraction Progress Banner */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-outline-variant/60 shadow-xs shrink-0">
                <div className="flex items-center gap-3">
                  {isExtracting ? (
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 animate-pulse">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface">
                        {isExtracting
                          ? `Extracting Candidate Profile (${currentExtractingIndex + 1}/${selectedUploadIds.length})`
                          : `Extraction Complete (${extractedCandidates.length} candidate${extractedCandidates.length === 1 ? "" : "s"} staged)`}
                      </span>
                      {currentJob && (
                        <Badge variant="neutral" className="text-[10px] py-0 px-2 font-mono">
                          Target: {currentJob.title}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                      {isExtracting
                        ? `Parsing multi-aspect profile from ${currentFilename}...`
                        : `All candidate aspects extracted and persisted directly to PostgreSQL.`}
                    </p>
                  </div>
                </div>

                {/* Deck Navigation Controls */}
                {candidateReviewItems.length > 1 && (
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      Card {activeCardIndex + 1} of {candidateReviewItems.length}
                    </span>
                    <div className="inline-flex items-center border border-outline-variant/60 rounded-lg overflow-hidden bg-surface-container">
                      <button
                        type="button"
                        onClick={() => setActiveCardIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeCardIndex === 0}
                        className="p-1.5 hover:bg-surface-container-high disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-on-surface-variant"
                        title="Previous candidate (Up/Left)"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCardIndex((prev) =>
                            Math.min(candidateReviewItems.length - 1, prev + 1)
                          )
                        }
                        disabled={activeCardIndex === candidateReviewItems.length - 1}
                        className="p-1.5 hover:bg-surface-container-high disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-on-surface-variant"
                        title="Next candidate (Down/Right)"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stacked Cards Deck Area */}
              <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden py-4">
                {candidateReviewItems.length === 0 && isExtracting && (
                  <div className="text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center animate-spin">
                      <RotateCcw className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold text-on-surface">
                      Parsing document text and normalizing candidate aspects...
                    </p>
                    <p className="text-[11px] text-on-surface-variant font-mono">
                      Target Job: {currentJob?.title}
                    </p>
                  </div>
                )}

                {/* Layered / Cascading Deck Animation */}
                <div className="relative w-full max-w-2xl h-[440px] flex items-center justify-center">
                  <AnimatePresence mode="sync">
                    {candidateReviewItems.map((item, idx) => {
                      const diff = idx - activeCardIndex;
                      const isActive = diff === 0;

                      // Stacking physics:
                      // Active card: center, scale 1, zIndex 30
                      // Cards below/above: slight vertical translation (-32px per card), slight scale reduction
                      // Slightly projected outward so the top border and title of underlying cards peek out
                      const yOffset = diff * -30;
                      const scale = Math.max(0.85, 1 - Math.abs(diff) * 0.04);
                      const zIndex = 30 - Math.abs(diff);
                      const opacity = Math.max(0.4, 1 - Math.abs(diff) * 0.18);

                      const { candidate } = item;
                      const currentRole = candidate.work_history.entries[0];
                      const primaryEdu = candidate.education.entries[0];
                      const locationCity =
                        candidate.identity.location.normalized?.city ||
                        candidate.identity.location.raw ||
                        "Unspecified";

                      return (
                        <motion.div
                          key={candidate.id}
                          layout
                          initial={{ opacity: 0, y: 50, scale: 0.9 }}
                          animate={{
                            opacity,
                            y: yOffset,
                            scale,
                            zIndex,
                          }}
                          exit={{ opacity: 0, scale: 0.85, y: -50 }}
                          transition={STACK_SPRING}
                          onClick={() => setActiveCardIndex(idx)}
                          className={`absolute inset-x-0 cursor-pointer rounded-2xl border bg-surface p-6 shadow-xl select-none transition-shadow ${
                            isActive
                              ? "border-primary/80 ring-1 ring-primary/20 shadow-2xl"
                              : "border-outline-variant/60 hover:border-outline-variant hover:shadow-2xl"
                          }`}
                          style={{
                            height: "400px",
                            transformOrigin: "bottom center",
                          }}
                        >
                          {/* Card Content */}
                          <div className="h-full flex flex-col justify-between">
                            {/* Card Header */}
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-on-surface tracking-tight truncate">
                                      {candidate.identity.name}
                                    </h3>
                                    <Badge variant="neutral" className="text-xs font-semibold gap-1 py-0.5 px-2">
                                      <MapPin className="h-3 w-3 text-on-surface-variant shrink-0" />
                                      <span>{locationCity}</span>
                                    </Badge>
                                    <Badge variant="success" className="text-xs py-0.5 px-2">
                                      Parsed Profile
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap pt-1.5">
                                    {currentRole && (
                                      <span className="flex items-center gap-1 font-semibold text-on-surface">
                                        <Briefcase className="h-3 w-3 text-on-surface-variant shrink-0" />
                                        <span className="truncate max-w-[220px]">
                                          {currentRole.title} • {currentRole.employer}
                                        </span>
                                      </span>
                                    )}

                                    <span className="flex items-center gap-1 font-medium">
                                      <Building2 className="h-3 w-3 text-on-surface-variant shrink-0" />
                                      <span>{item.verifiedYearsExperience} yrs exp</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-mono text-on-surface-variant/80 block">
                                    {candidate.source_document.filename}
                                  </span>
                                  <span className="text-[10px] font-mono text-primary block mt-0.5">
                                    ID: {candidate.id}
                                  </span>
                                </div>
                              </div>

                              {/* Education Section */}
                              {primaryEdu && (
                                <div className="pt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                                  <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                                  <span className="truncate">
                                    {primaryEdu.degree_level.normalized || primaryEdu.degree_level.raw} in{" "}
                                    {primaryEdu.field?.normalized || primaryEdu.field?.raw || "Engineering"} •{" "}
                                    {primaryEdu.institution.normalized || primaryEdu.institution.raw}
                                  </span>
                                </div>
                              )}

                              {/* Skills Section */}
                              <div className="pt-2 space-y-1.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
                                  Demonstrated Competencies
                                </span>
                                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                                  {candidate.skills_demonstrated?.skills?.slice(0, 6).map((s, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-surface-container border border-outline-variant/40 text-on-surface"
                                    >
                                      {s.skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Bar */}
                            <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                              <span className="text-[11px] font-mono">
                                {isActive ? "Active candidate in focus" : "Click card to focus"}
                              </span>
                              <div className="flex items-center gap-2 font-mono text-[11px] text-primary font-semibold">
                                <span>Linked to: {currentJob?.title}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-outline-variant/40 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            {!isFinished && !isExtracting && (
              <p className="text-xs text-on-surface-variant">
                Ready to extract {selectedUploadIds.length} document(s) into{" "}
                <strong className="text-on-surface">{currentJob?.title}</strong>
              </p>
            )}
            {isFinished && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Successfully extracted and persisted {extractedCandidates.length} candidate(s).</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {!isFinished && !isExtracting && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 px-3 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={startExtraction}
                  disabled={selectedUploadIds.length === 0}
                  className="h-8 px-4 rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Start Extraction</span>
                </Button>
              </>
            )}

            {isFinished && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-8 px-3 rounded-xl text-xs font-semibold"
                >
                  Close
                </Button>

                <Link href="/review/focus">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-3.5 rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Open in Focus Mode</span>
                  </Button>
                </Link>

                <Link href="/review">
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-8 px-4 rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <span>Review Queue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
