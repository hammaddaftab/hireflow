"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Briefcase,
  FileText,
  ArrowRight,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import type { Job } from "@/entities/job";
import type { UploadedResumeRecord } from "@/lib/upload";

export interface ResumeIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploads: UploadedResumeRecord[];
  jobs: Job[];
  initialJobId?: string;
  onProceed: (params: { jobId: string; uploadIds: string[] }) => void;
}

export function ResumeIngestionModal({
  isOpen,
  onClose,
  uploads,
  jobs,
  initialJobId,
  onProceed,
}: ResumeIngestionModalProps) {
  // Job selection state
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId || jobs[0]?.id || "job-sample-1"
  );

  // Only unprocessed / unlinked uploads are shown (single job per resume policy)
  const unprocessedUploads = useMemo(() => {
    return uploads.filter((u) => !u.jobId);
  }, [uploads]);

  const [selectedUploadIds, setSelectedUploadIds] = useState<string[]>([]);

  // Sync selected uploads and target job when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUploadIds(unprocessedUploads.map((u) => u.id));
      if (initialJobId) {
        setSelectedJobId(initialJobId);
      } else if (jobs[0]?.id) {
        setSelectedJobId(jobs[0].id);
      }
    }
  }, [isOpen, unprocessedUploads, initialJobId, jobs]);

  // Selected job entity
  const currentJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  // Toggle selection for a specific upload
  const toggleUploadSelection = (id: string) => {
    setSelectedUploadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Keyboard navigation for closing modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleProceed = () => {
    if (selectedUploadIds.length === 0 || !selectedJobId) return;
    onProceed({ jobId: selectedJobId, uploadIds: selectedUploadIds });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 !m-0 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
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
                Ingest Resumes into Job
              </Typography>
              <p className="text-[11px] text-on-surface-variant">
                Select an open position and target documents to parse and evaluate candidate profiles
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Body: Action Configuration */}
        <div className="flex-1 overflow-y-auto pt-5 space-y-6 bg-surface-container-lowest">
          {/* Step 1: Select Target Job (Flat list with no lateral borders or rounded edges) */}
          <div className="space-y-2">
            <div className="px-6 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <span>1. Select Target Job</span>
              </label>
            </div>

            <div className="border-y border-outline-variant/40 divide-y divide-outline-variant/30 bg-surface max-h-48 overflow-y-auto">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`px-6 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/5"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant bg-surface"
                        }`}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-on-primary" />}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`text-xs font-bold truncate block transition-colors ${
                            isSelected ? "text-primary" : "text-on-surface"
                          }`}
                        >
                          {job.title}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {job.department} • {job.location}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Resumes to Ingest (Flat list with no lateral borders or rounded edges) */}
          <div className="space-y-2">
            <div className="px-6 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>2. Select Uploaded Documents ({selectedUploadIds.length}/{unprocessedUploads.length})</span>
              </label>

              {unprocessedUploads.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUploadIds(unprocessedUploads.map((u) => u.id))}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-on-surface-variant text-[11px]">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedUploadIds([])}
                    className="text-[11px] text-on-surface-variant hover:text-on-surface cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            <div className="border-y border-outline-variant/40 divide-y divide-outline-variant/30 bg-surface max-h-56 overflow-y-auto">
              {unprocessedUploads.length === 0 ? (
                <div className="px-6 py-6 text-center text-xs text-on-surface-variant">
                  No new documents available. All resumes have already been linked to a job.
                </div>
              ) : (
                unprocessedUploads.map((upload) => {
                  const isSelected = selectedUploadIds.includes(upload.id);
                  return (
                    <div
                      key={upload.id}
                      onClick={() => toggleUploadSelection(upload.id)}
                      className={`px-6 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <Typography variant="body-small">
            {selectedUploadIds.length > 0
              ? `Ready to ingest ${selectedUploadIds.length} document(s) into ${currentJob?.title || "selected role"}`
              : "Select at least 1 document to proceed"}
          </Typography>

          <Button
            variant="primary"
            size="sm"
            onClick={handleProceed}
            disabled={selectedUploadIds.length === 0 || !selectedJobId}
            className="h-8 px-4 rounded-xl text-xs font-semibold gap-1.5 shadow-xs self-end sm:self-center"
          >
            <span>Proceed ({selectedUploadIds.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
