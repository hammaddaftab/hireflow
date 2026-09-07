"use client";

import React from "react";
import { UploadCloud } from "lucide-react";
import { Typography } from "@/components/ui/Typography";

export interface ResumeDropOverlayProps {
  isVisible: boolean;
}

export function ResumeDropOverlay({ isVisible }: ResumeDropOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 !m-0 pointer-events-none flex items-center justify-center p-6 sm:p-12 bg-background/80 backdrop-blur-sm animate-in fade-in-50 duration-150"
    >
      <div className="max-w-xl w-full border-2 border-dashed border-primary bg-surface-container-low/95 shadow-2xl rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
          <UploadCloud className="h-8 w-8 text-primary animate-pulse" />
        </div>

        <div className="space-y-1">
          <Typography variant="headline-medium" className="text-on-surface font-bold">
            Drop Candidate Resumes
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant max-w-sm mx-auto">
            Files will be stored securely in Vercel Blob Storage and queued for candidate ingestion.
          </Typography>
        </div>

        <div className="flex items-center gap-2 pt-2 text-xs font-medium text-on-surface-variant">
          <span className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant font-mono">
            PDF, DOCX, TXT
          </span>
          <span className="text-on-surface-variant/70">• Max 25 MB</span>
        </div>
      </div>
    </div>
  );
}
