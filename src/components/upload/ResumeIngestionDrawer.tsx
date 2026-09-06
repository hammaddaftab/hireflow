"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Database,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { Tooltip } from "@/components/ui/Tooltip";
import type { DroppedResumeItem } from "@/lib/upload/types";

export interface ResumeIngestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  uploads: DroppedResumeItem[];
  onRemoveUpload: (id: string) => void;
  onClearCompleted: () => void;
  onFilesSelected: (files: FileList | File[]) => void;
  isUploading: boolean;
  onTriggerExtraction?: (upload: DroppedResumeItem) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ResumeIngestionDrawer({
  isOpen,
  onClose,
  uploads,
  onRemoveUpload,
  onClearCompleted,
  onFilesSelected,
  isUploading,
  onTriggerExtraction,
}: ResumeIngestionDrawerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (uploads.length === 0 && !isOpen) {
    return null;
  }

  const storedCount = uploads.filter((u) => u.status === "stored").length;
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;
  const errorCount = uploads.filter((u) => u.status === "error").length;

  const handleCopyUrl = async (id: string, url?: string) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard write fallback
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = "";
    }
  };

  // Minimized floating dock pill
  if (isMinimized || !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-in fade-in-50 slide-in-from-bottom-2">
        <div className="flex items-center gap-2 p-2 bg-surface-container-high/95 backdrop-blur-md border border-outline-variant/60 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 pl-2">
            <Database className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-on-surface">
              Blob Storage ({storedCount}/{uploads.length})
            </span>
          </div>

          {uploadingCount > 0 && (
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" title="Uploading in progress" />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="h-7 w-7 p-0 rounded-xl text-on-surface-variant hover:text-on-surface cursor-pointer"
            title="Expand resume drawer"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 rounded-xl text-on-surface-variant hover:text-on-surface cursor-pointer"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[92vw] sm:w-[460px] max-h-[85vh] flex flex-col animate-in fade-in-50 slide-in-from-bottom-3 duration-200">
      <Card className="flex flex-col max-h-[85vh] overflow-hidden rounded-2xl border border-outline-variant/80 bg-surface/95 backdrop-blur-md shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/50 bg-surface-container-low">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <Typography variant="title-medium" className="text-on-surface font-bold text-sm leading-tight">
                Vercel Blob Storage Queue
              </Typography>
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-mono">
                <span>{storedCount} stored</span>
                {uploadingCount > 0 && <span>• {uploadingCount} uploading</span>}
                {errorCount > 0 && <span className="text-rose-600 dark:text-rose-400">• {errorCount} failed</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.doc,.md"
              className="hidden"
              onChange={handleFileInput}
              aria-label="Upload candidate resumes"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2 text-xs text-on-surface font-medium hover:bg-surface-container rounded-lg cursor-pointer"
              title="Add more candidate resumes"
            >
              <UploadCloud className="h-3.5 w-3.5 mr-1 text-primary" />
              <span>Add</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-7 w-7 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
              title="Minimize drawer"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
              title="Close drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Step 1 Status Callout Banner */}
        <div className="p-3 bg-surface-container border-b border-outline-variant/40 text-xs text-on-surface-variant">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-semibold text-on-surface block">
                Step 1: Stored in Vercel Blob Storage
              </span>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                Candidate resumes are stored as blobs. Step 2 will bind these documents directly to LLM extraction.
              </p>
            </div>
          </div>
        </div>

        {/* Resumes List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[380px] custom-scrollbar">
          {uploads.length === 0 ? (
            <div className="p-8 text-center text-xs text-on-surface-variant space-y-2">
              <UploadCloud className="h-8 w-8 mx-auto text-outline-variant" />
              <p>Drag and drop candidate resumes anywhere on the screen to upload.</p>
            </div>
          ) : (
            uploads.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 hover:border-outline-variant transition-colors space-y-2"
              >
                {/* File Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-on-surface truncate" title={item.filename}>
                        {item.filename}
                      </p>
                      <p className="text-[11px] font-mono text-on-surface-variant">
                        {formatBytes(item.size)}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {item.status === "uploading" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-200">
                        <span className="h-2 w-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        <span>Uploading...</span>
                      </span>
                    )}

                    {item.status === "stored" && (
                      <Badge variant="success" className="text-[10px] py-0 px-2">
                        Stored in Blob
                      </Badge>
                    )}

                    {item.status === "error" && (
                      <Badge variant="dealbreaker" className="text-[10px] py-0 px-2">
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stored Blob Metadata & Actions */}
                {item.status === "stored" && (
                  <div className="pt-1.5 border-t border-outline-variant/40 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Tooltip content={item.blobUrl || item.pathname || "Vercel Blob Reference"}>
                        <span className="text-[10px] font-mono text-on-surface-variant/80 truncate block">
                          {item.pathname || item.blobUrl}
                        </span>
                      </Tooltip>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.blobUrl && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUrl(item.id, item.blobUrl)}
                            className="h-6 w-6 p-0 text-on-surface-variant hover:text-on-surface rounded-md cursor-pointer"
                            title="Copy Blob URL"
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>

                          {item.blobUrl.startsWith("http") && (
                            <a
                              href={item.blobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="h-6 w-6 inline-flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-md cursor-pointer transition-colors"
                              title="Open resume document in new tab"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveUpload(item.id)}
                        className="h-6 w-6 p-0 text-on-surface-variant hover:text-rose-600 rounded-md cursor-pointer"
                        title="Remove from queue list"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Staged for Step 2: LLM Extraction */}
                {item.status === "stored" && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] font-semibold text-primary font-mono tracking-wide">
                      Ready for LLM Extraction
                    </span>

                    {onTriggerExtraction && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTriggerExtraction(item)}
                        className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary-container rounded-md gap-1"
                        title="Bind and trigger LLM profile extraction (Step 2)"
                      >
                        <span>Extract</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Error details */}
                {item.status === "error" && (
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-rose-600 dark:text-rose-400">
                    <div className="flex items-center gap-1 min-w-0">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.error || "Failed to upload to blob storage"}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveUpload(item.id)}
                      className="h-6 w-6 p-0 text-on-surface-variant hover:text-on-surface rounded-md"
                      title="Dismiss error"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {uploads.length > 0 && (
          <div className="p-3 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              disabled={storedCount === 0}
              className="text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Clear Stored ({storedCount})
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold rounded-xl"
            >
              Done
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
