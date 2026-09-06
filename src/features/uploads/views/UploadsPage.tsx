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
  ExternalLink,
  Trash2,
  Search,
  Database,
  ArrowRight,
  RefreshCw,
  HardDrive,
  Clock,
  Briefcase,
  Layers,
  Inbox
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { Tooltip } from "@/components/ui/Tooltip";
import type { UploadedResumeRecord } from "@/lib/upload/types";
import { ResumeDropOverlay } from "@/components/upload";

export interface UploadsPageProps {
  initialUploads: UploadedResumeRecord[];
  isBlobConfigured: boolean;
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

export function UploadsPage({ initialUploads, isBlobConfigured }: UploadsPageProps) {
  const [uploads, setUploads] = useState<UploadedResumeRecord[]>(initialUploads);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

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

  // Delete a specific upload
  const handleDeleteUpload = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/upload?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUploads((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      // Ignore delete error
    }
  };

  // Clear all uploads
  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all uploaded resume records from the list?")) return;
    try {
      const res = await fetch("/api/resumes/upload", { method: "DELETE" });
      if (res.ok) {
        setUploads([]);
      }
    } catch {
      // Ignore clear error
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
        u.hash.toLowerCase().includes(q) ||
        (u.jobId && u.jobId.toLowerCase().includes(q)) ||
        u.pathname.toLowerCase().includes(q)
    );
  }, [uploads, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalBytes = uploads.reduce((acc, u) => acc + u.size, 0);
    const stored = uploads.filter((u) => u.status === "stored").length;
    return {
      total: uploads.length,
      stored,
      totalBytes,
    };
  }, [uploads]);

  return (
    <div className="max-w-[1600px] mx-auto pb-16 space-y-6">
      {/* Full-screen Drag Overlay */}
      <ResumeDropOverlay isVisible={isDraggingOver} />

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
      <header className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                HireFlow Ingestion
              </span>
              <span className="text-xs text-on-surface-variant font-mono">• Vercel Blob Storage</span>
            </div>
            <Typography variant="headline-medium" className="text-on-surface font-bold">
              Resume Uploads & Stored Documents
            </Typography>
            <Typography variant="body-medium" className="text-on-surface-variant text-xs mt-1">
              Repository of candidate resumes stored in Vercel Blob Storage, staged for Step 2 LLM profile extraction.
            </Typography>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/60 text-xs text-on-surface-variant">
              <Database className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium">
                {isBlobConfigured ? "Vercel Blob: Connected" : "Vercel Blob: Local Mode"}
              </span>
            </div>

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

            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              className="h-8 px-3.5 rounded-xl gap-1.5 text-xs font-semibold shadow-xs"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload Resumes</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/60 flex items-center justify-between gap-3 text-xs text-on-surface animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface rounded-2xl border border-outline-variant/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold uppercase tracking-wider">Total Documents</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <Typography variant="title-large" className="text-2xl font-bold text-on-surface">
            {stats.total}
          </Typography>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Candidate files tracked
          </span>
        </Card>

        <Card className="p-4 bg-surface rounded-2xl border border-outline-variant/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold uppercase tracking-wider">Stored in Blob</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <Typography variant="title-large" className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {stats.stored}
          </Typography>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Persisted to storage
          </span>
        </Card>

        <Card className="p-4 bg-surface rounded-2xl border border-outline-variant/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold uppercase tracking-wider">Storage Footprint</span>
            <HardDrive className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <Typography variant="title-large" className="text-2xl font-bold text-on-surface">
            {formatBytes(stats.totalBytes)}
          </Typography>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Total binary size
          </span>
        </Card>

        <Card className="p-4 bg-surface rounded-2xl border border-outline-variant/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold uppercase tracking-wider">Step 2 Status</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <Typography variant="title-large" className="text-2xl font-bold text-primary">
            {stats.stored} Ready
          </Typography>
          <span className="text-[11px] text-on-surface-variant font-mono">
            Staged for LLM extraction
          </span>
        </Card>
      </div>

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
              placeholder="Search by filename, hash, or job ID..."
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
                className="h-7 px-2 text-xs text-on-surface-variant hover:text-rose-600 rounded-lg"
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
                    <th className="py-3 px-4">Vercel Blob Reference</th>
                    <th className="py-3 px-4">SHA-256 Digest</th>
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
                            <span className="font-bold text-on-surface block truncate max-w-[180px] sm:max-w-xs" title={item.filename}>
                              {item.filename}
                            </span>
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

                      {/* Blob URL / Path */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <Tooltip content={item.blobUrl || item.pathname}>
                          <span className="font-mono text-[11px] text-on-surface-variant truncate block">
                            {item.pathname || item.blobUrl}
                          </span>
                        </Tooltip>
                      </td>

                      {/* SHA-256 Digest */}
                      <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                        <Tooltip content={item.hash ? item.hash : "Hashing disabled by default so you can re-drop the same resume. Set ENABLE_RESUME_HASHING=true in .env to enable."}>
                          <span className="cursor-help underline decoration-dotted">
                            {item.hash ? `${item.hash.slice(0, 8)}...${item.hash.slice(-6)}` : "Off (re-drop enabled)"}
                          </span>
                        </Tooltip>
                      </td>

                      {/* Linked Job */}
                      <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                        {item.jobId ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-primary">
                            <Briefcase className="h-3 w-3" />
                            {item.jobId}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/60 font-mono">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <Badge variant="success" className="text-[10px] py-0 px-2">
                            Stored in Blob
                          </Badge>
                          <span className="text-[10px] font-mono text-primary block">
                            Ready for Step 2
                          </span>
                        </div>
                      </td>

                      {/* Upload Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-on-surface-variant/70" />
                          {formatDate(item.uploadedAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Copy URL */}
                          {item.blobUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyUrl(item.id, item.blobUrl)}
                              className="h-7 w-7 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
                              title="Copy Vercel Blob URL"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}

                          {/* Open external */}
                          {item.blobUrl && item.blobUrl.startsWith("http") && (
                            <a
                              href={item.blobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="h-7 w-7 inline-flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-lg transition-colors cursor-pointer"
                              title="Open document in new tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}

                          {/* Delete row */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUpload(item.id)}
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

      {/* Step 2 Architecture Callout Card */}
      <Card className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <Typography variant="title-medium" className="text-on-surface font-bold text-xs">
              Next Step: Bind to LLM Candidate Extraction
            </Typography>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              These uploaded documents in Vercel Blob Storage are ready to be ingested through the multi-aspect LLM extraction pipeline to automatically populate candidate profiles in the Review Queue.
            </p>
          </div>
        </div>

        <Link href="/review" className="shrink-0 self-end sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3.5 text-xs font-semibold rounded-xl gap-1.5"
          >
            <span>Go to Review Queue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
