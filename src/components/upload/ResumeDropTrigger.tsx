"use client";

import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ResumeDropTriggerProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onToggleDrawer: () => void;
  uploadCount: number;
  isUploading: boolean;
  className?: string;
}

export function ResumeDropTrigger({
  onFilesSelected,
  onToggleDrawer,
  uploadCount,
  isUploading,
  className = "",
}: ResumeDropTriggerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (uploadCount > 0) {
      onToggleDrawer();
    } else if (fileInputRef.current) {
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

      <Button
        variant="secondary"
        size="sm"
        onClick={handleButtonClick}
        isLoading={isUploading}
        className="h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border-0 cursor-pointer transition-colors"
        title={uploadCount > 0 ? "View uploaded resumes in Vercel Blob" : "Select resumes to upload to Vercel Blob"}
      >
        <UploadCloud className="h-3.5 w-3.5 shrink-0" />
        <span>{uploadCount > 0 ? `Resumes (${uploadCount})` : "Drop Resumes"}</span>
      </Button>

      {uploadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 px-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg"
          title="Add more resumes"
        >
          Add More
        </Button>
      )}
    </div>
  );
}
