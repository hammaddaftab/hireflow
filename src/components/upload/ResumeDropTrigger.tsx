"use client";

import React, { useRef } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

export interface ResumeDropTriggerProps {
  onFilesSelected: (files: FileList | File[]) => void;
  uploadCount?: number;
  isUploading?: boolean;
  statusLabel?: string | null;
  className?: string;
}

export function ResumeDropTrigger({
  onFilesSelected,
  uploadCount = 0,
  isUploading = false,
  statusLabel = null,
  className = "",
}: ResumeDropTriggerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.docx,.doc,.md"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Upload candidate resumes"
      />

      <Tooltip
        side="bottom"
        className="max-w-xs p-3 rounded-xl bg-surface-container-highest border border-amber-500/40 text-on-surface shadow-xl space-y-1"
        content={
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Attention: Recommended Ingestion Flow</span>
            </div>
            <p className="text-[11px] leading-relaxed text-on-surface-variant font-normal">
              Quick drop parses directly into this job. For full batch ingestion with live extraction telemetry, comprehensive candidate feedback decks, and multi-file tracking, uploading and extraction is much better handled in the <strong>Uploads</strong> section.
            </p>
          </div>
        }
      >
        <div className="inline-flex">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleButtonClick}
            isLoading={isUploading}
            className="h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border-0 cursor-pointer transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5 shrink-0" />
            <span>{statusLabel || (isUploading ? "Uploading..." : "Drop Resumes")}</span>
          </Button>
        </div>
      </Tooltip>
    </div>
  );
}
