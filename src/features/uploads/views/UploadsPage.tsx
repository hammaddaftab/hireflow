"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  X,
  Maximize2,
  Trash2,
  Search,
  ArrowRight,
  RefreshCw,
  Clock,
  Briefcase,
  Inbox,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import type { UploadedResumeRecord } from "@/lib/upload/types";
import type { Job } from "@/entities/job";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import { ResumeDropOverlay } from "@/components/upload";
import { ResumeIngestionModal } from "../components/ResumeIngestionModal";
import { IngestionFeedbackDeck } from "../components/IngestionFeedbackDeck";

export interface UploadsPageProps {
  initialUploads: UploadedResumeRecord[];
  isBlobConfigured: boolean;
  initialJobs?: Job[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function UploadsPage({ initialUploads, isBlobConfigured: _isBlobConfigured, initialJobs = [] }: UploadsPageProps) {
  const [uploads, setUploads] = useState<UploadedResumeRecord[]>(initialUploads);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<UploadedResumeRecord | null>(null);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [preselectedUploadId, setPreselectedUploadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Ingestion processing & feedback deck state in main outer window
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionJobId, setIngestionJobId] = useState<string | null>(null);
  const [ingestProgress, setIngestProgress] = useState<{
    current: number;
    total: number;
    filename: string;
  }>({ current: 0, total: 0, filename: "" });
  const [extractedCandidates, setExtractedCandidates] = useState<ParsedCandidateProfile[]>([]);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [showFeedbackDeck, setShowFeedbackDeck] = useState(false);

  // Target job entity for feedback deck
  const currentIngestionJob = useMemo(() => {
    return jobs.find((j) => j.id === ingestionJobId) || jobs[0];
  }, [jobs, ingestionJobId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Fetch jobs if none passed in initial props
  useEffect(() => {
    if (jobs.length === 0) {
      fetch("/api/jobs")
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            setJobs(json.data);
          }
        })
        .catch(() => {
          // Ignore job fetch error
        });
    }
  }, [jobs.length]);

  // Compute preview URL: direct Vercel Blob URL or local streaming endpoint
  const getPreviewUrl = (item: UploadedResumeRecord): string => {
    if (item.blobUrl && item.blobUrl.startsWith("http")) {
      return item.blobUrl;
    }
    return `/api/resumes/${encodeURIComponent(item.id)}/view`;
  };

  // Preview action: Ctrl+Click opens in new tab, normal click opens in-app modal
  const handlePreviewAction = (e: React.MouseEvent, item: UploadedResumeRecord) => {
    if (e.ctrlKey || e.metaKey) {
      window.open(getPreviewUrl(item), "_blank");
    } else {
      setPreviewItem(item);
    }
  };

  // Close preview modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewItem(null);
      }
    };
    if (previewItem) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewItem]);

  // Fetch updated list from server
  const refreshUploads = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/resumes/upload");
      if (res.ok) {
        const json = await res.json();
        if (json.data?.uploads) {
          setUploads(json.data.uploads);
        }
      }
    } catch {
      // Ignore refresh error
    } finally {
      setIsRefreshing(false);
    }
  };

  // Upload multiple resume files
  const handleUploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploading(true);
    setFeedbackMessage(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.detail || "Upload failed";
        setFeedbackMessage(`Error: ${msg}`);
        return;
      }

      const json = await res.json();
      if (json.data?.uploads) {
        setUploads((prev) => [...json.data.uploads, ...prev]);
        setFeedbackMessage(`Successfully stored ${json.data.uploads.length} document(s) in Vercel Blob Storage.`);
        setTimeout(() => setFeedbackMessage(null), 5000);
      }
    } catch {
      setFeedbackMessage("Network error during resume upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Start sequential extraction and show feedback deck in the main window
  const handleProceedIngestion = async ({
    jobId,
    uploadIds,
  }: {
    jobId: string;
    uploadIds: string[];
  }) => {
    if (uploadIds.length === 0 || !jobId) return;

    setIngestionJobId(jobId);
    setIsIngesting(true);
    setShowFeedbackDeck(true);
    setExtractedCandidates([]);
    setIngestionError(null);
    setIngestProgress({ current: 0, total: uploadIds.length, filename: "" });

    const queuedUploads = uploads.filter((u) => uploadIds.includes(u.id));

    for (let i = 0; i < queuedUploads.length; i++) {
      const upload = queuedUploads[i];
      setIngestProgress({
        current: i,
        total: queuedUploads.length,
        filename: upload.filename,
      });

      try {
        const response = await fetch("/api/resumes/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId: upload.id,
            jobId,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `Failed to extract ${upload.filename}`
          );
        }

        const data = await response.json();
        const candidate: ParsedCandidateProfile = data.data.candidate;
        setExtractedCandidates((prev) => [...prev, candidate]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setIngestionError(`Error extracting ${upload.filename}: ${msg}`);
      }
    }

    setIsIngesting(false);
    refreshUploads();
  };

  // Delete a specific upload
  const handleDeleteUpload = async (id: string, filename?: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resumes/upload?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUploads((prev) => prev.filter((item) => item.id !== id));
        setFeedbackMessage(`Removed ${filename ? `"${filename}"` : "document"} from uploads.`);
        setTimeout(() => setFeedbackMessage(null), 4000);
      } else {
        setFeedbackMessage(`Failed to delete ${filename ? `"${filename}"` : "document"}.`);
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch {
      setFeedbackMessage(`Network error while deleting ${filename ? `"${filename}"` : "document"}.`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all uploads
  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all uploaded resume records from the list?")) return;
    setIsClearingAll(true);
    try {
      const res = await fetch("/api/resumes/upload", { method: "DELETE" });
      if (res.ok) {
        setUploads([]);
        setFeedbackMessage("All uploaded resume records have been removed.");
        setTimeout(() => setFeedbackMessage(null), 4000);
      } else {
        setFeedbackMessage("Failed to clear uploaded resumes.");
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch {
      setFeedbackMessage("Network error while clearing uploaded resumes.");
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  // Drag and drop listeners on window
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files")) {
        dragCounterRef.current += 1;
        setIsDraggingOver(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleUploadFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Filtered documents
  const filteredUploads = useMemo(() => {
    if (!searchQuery.trim()) return uploads;
    const q = searchQuery.toLowerCase();
    return uploads.filter(
      (u) =>
        u.filename.toLowerCase().includes(q) ||
        (u.jobId && u.jobId.toLowerCase().includes(q))
    );
  }, [uploads, searchQuery]);

  // Upload counts (New vs Total)
  const newUploadsCount = useMemo(() => {
    return uploads.filter((u) => !u.jobId).length;
  }, [uploads]);

  const totalUploadsCount = uploads.length;

  return (
    <>
      {/* Full-screen Drag Overlay */}
      <ResumeDropOverlay isVisible={isDraggingOver} />

      <div className="max-w-[1600px] mx-auto pb-16 space-y-6">

      {/* Hidden file picker input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.docx,.doc,.md"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUploadFiles(e.target.files);
            e.target.value = "";
          }
        }}
        aria-label="Upload candidate resumes"
      />

      {/* Header Section */}
      {/* Header Section (Emphasizes New, Unemphasized Total, No Sandbox Button) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              {newUploadsCount} New {newUploadsCount === 1 ? "Resume" : "Resumes"}
            </h1>
            {newUploadsCount > 0 && (
              <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-semibold">
                Awaiting Ingestion
              </Badge>
            )}
          </div>
          <p className="text-xs text-on-surface-variant font-mono mt-0.5">
            {totalUploadsCount} total document{totalUploadsCount === 1 ? "" : "s"} uploaded
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshUploads}
            isLoading={isRefreshing}
            className="h-8 px-2.5 rounded-xl"
            title="Refresh upload list"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Link href="/review">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl gap-1.5 text-xs font-semibold"
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>Review Queue</span>
            </Button>
          </Link>

          {newUploadsCount > 0 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setPreselectedUploadId(null);
                setIsIngestionOpen(true);
              }}
              disabled={isUploading}
              className="h-8 px-3.5 rounded-xl gap-1.5 text-xs font-semibold shadow-xs"
              title="Extract newly uploaded resumes into candidate profiles"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ingest into Job ({newUploadsCount})</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              className="h-8 px-3.5 rounded-xl gap-1.5 text-xs font-semibold shadow-xs"
              title="Upload candidate resumes"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload Resumes</span>
            </Button>
          )}
        </div>
      </header>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/60 flex items-center justify-between gap-3 text-xs text-on-surface animate-in fade-in-50">
          <div className="flex items-center gap-2">
            {feedbackMessage.startsWith("Error") || feedbackMessage.startsWith("Failed") || feedbackMessage.startsWith("Network") ? (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{feedbackMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFeedbackMessage(null)}
            className="h-6 px-2 text-xs text-on-surface-variant"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Outer Window Ingestion Processing & Output Cards Feedback */}
      {showFeedbackDeck && currentIngestionJob && (
        <IngestionFeedbackDeck
          isExtracting={isIngesting}
          currentIndex={ingestProgress.current}
          totalCount={ingestProgress.total}
          currentFilename={ingestProgress.filename}
          candidates={extractedCandidates}
          targetJob={currentIngestionJob}
          errorMessage={ingestionError}
          onDismiss={() => setShowFeedbackDeck(false)}
        />
      )}

      {/* Prominent Drag and Drop Ingestion Card */}
      <Card
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-outline-variant hover:border-primary bg-surface-container-low/60 hover:bg-surface-container-low transition-all duration-200 rounded-2xl cursor-pointer text-center space-y-3"
      >
        <div className="h-12 w-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <UploadCloud className={`h-6 w-6 ${isUploading ? "animate-bounce" : ""}`} />
        </div>

        <div className="space-y-1">
          <Typography variant="title-medium" className="text-on-surface font-bold">
            {isUploading ? "Uploading Documents to Vercel Blob..." : "Drag and Drop Resumes Here"}
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant text-xs max-w-md mx-auto">
            Drop PDF, DOCX, or TXT candidate resumes to persist them into Vercel Blob Storage with SHA-256 provenance hashes.
          </Typography>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1 text-xs">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-3 text-xs rounded-xl font-semibold pointer-events-none"
          >
            Select from Computer
          </Button>
          <span className="text-on-surface-variant/70 text-[11px]">or drag anywhere on page</span>
        </div>
      </Card>

      {/* Search and Table Area */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or job ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Counts & Clear Action */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>
              Showing <strong className="text-on-surface">{filteredUploads.length}</strong> of{" "}
              <strong className="text-on-surface">{uploads.length}</strong> uploads
            </span>

            {uploads.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                isLoading={isClearingAll}
                disabled={isClearingAll || deletingId !== null}
                className="h-7 px-2 text-xs text-on-surface-variant hover:text-rose-600 rounded-lg cursor-pointer"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Uploads Data Table */}
        <Card className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface shadow-xs">
          {filteredUploads.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
              <FileText className="h-8 w-8 mx-auto text-outline-variant" />
              <p className="font-semibold text-on-surface text-sm">No uploaded resumes match your criteria.</p>
              <p>Drag candidate resumes onto the dropzone above or click to browse files.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Linked Job</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Uploaded</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 font-normal">
                  {filteredUploads.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-container-low/40 transition-colors"
                    >
                      {/* Document Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={(e) => handlePreviewAction(e, item)}
                              className="font-bold text-on-surface hover:text-primary hover:underline block truncate max-w-[200px] sm:max-w-xs text-left cursor-pointer"
                              title="Click to preview in-app (Ctrl+Click to open in new tab)"
                            >
                              {item.filename}
                            </button>
                            <span className="text-[10px] uppercase font-mono text-on-surface-variant">
                              {item.contentType.replace("application/", "")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* File Size */}
                      <td className="py-3 px-4 font-mono text-on-surface-variant whitespace-nowrap">
                        {formatBytes(item.size)}
                      </td>

                      {/* Linked Job */}
                      <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                        {item.jobId ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-primary">
                            <Briefcase className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {jobs.find((j) => j.id === item.jobId)?.title || item.jobId}
                            </span>
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/60 font-mono">—</span>
                        )}
                      </td>

                      {/* Status (Only New or Processed with View in queue) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.jobId ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="neutral" className="text-[10px] py-0.5 px-2 font-mono uppercase">
                              Processed
                            </Badge>
                            <Link
                              href="/review"
                              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                            >
                              <span>View in queue</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        ) : (
                          <Badge variant="primary" className="text-[10px] py-0.5 px-2 font-mono uppercase">
                            New
                          </Badge>
                        )}
                      </td>

                      {/* Upload Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-on-surface-variant/70 shrink-0" />
                          {formatDate(item.uploadedAt)}
                        </span>
                      </td>

                      {/* Actions (No star icon) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Preview document (Eye icon) */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handlePreviewAction(e, item)}
                            className="h-7 w-7 p-0 text-on-surface-variant hover:text-primary rounded-lg cursor-pointer"
                            title="Preview document (Ctrl+Click to open in new tab)"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {/* Copy URL */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(item.id, getPreviewUrl(item))}
                            className="h-7 w-7 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
                            title="Copy document URL"
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>

                          {/* Delete row */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUpload(item.id, item.filename)}
                            isLoading={deletingId === item.id}
                            disabled={deletingId !== null || isClearingAll}
                            className="h-7 w-7 p-0 text-on-surface-variant hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Remove upload record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      </div>

      {/* Document Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 !m-0 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ height: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/40 bg-surface-container-low shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Typography variant="title-medium" className="text-on-surface font-bold text-sm truncate">
                      {previewItem.filename}
                    </Typography>
                    <Badge variant="neutral" className="text-[10px] py-0 px-2 uppercase font-mono">
                      {previewItem.contentType.replace("application/", "")}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-on-surface-variant truncate">
                    {formatBytes(previewItem.size)} • {previewItem.pathname || previewItem.blobUrl}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getPreviewUrl(previewItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  title="Open in new tab"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </a>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewItem(null)}
                  className="h-8 w-8 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
                  title="Close preview (Esc)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body / Document Frame */}
            <div className="flex-1 w-full min-h-0 relative bg-surface-container-lowest">
              <iframe
                src={getPreviewUrl(previewItem)}
                title={`Preview of ${previewItem.filename}`}
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resume Ingestion Modal (Action Selection Only) */}
      <ResumeIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => {
          setIsIngestionOpen(false);
          setPreselectedUploadId(null);
        }}
        uploads={preselectedUploadId ? uploads.filter((u) => u.id === preselectedUploadId) : uploads}
        jobs={jobs}
        onProceed={handleProceedIngestion}
      />
    </>
  );
}
