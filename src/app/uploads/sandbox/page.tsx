export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { IsolatedUploadDialogue } from "@/features/uploads/components/IsolatedUploadDialogue";

export const metadata: Metadata = {
  title: "Upload Dialogue Sandbox - HireFlow",
  description: "Isolated UI testbench for upload dialogue interactions, card physics, and spatial animations.",
};

export default function UploadSandboxPage() {
  return (
    <div className="max-w-[1400px] mx-auto pb-16 space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/uploads"
              className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Resume Uploads</span>
            </Link>
            <span className="text-on-surface-variant/40">•</span>
            <span className="text-xs uppercase font-mono text-primary font-semibold">
              UI Interaction Isolation
            </span>
          </div>

          <Typography variant="headline-medium" className="text-on-surface font-bold text-xl sm:text-2xl">
            Upload & Ingestion Dialogue Playground
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant text-xs mt-0.5">
            Isolated environment to test modal geometry, swipe gestures, card movement, and spring physics.
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/review/focus">
            <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl text-xs gap-1.5 font-semibold">
              <Layers className="h-3.5 w-3.5" />
              <span>Focus Mode Reference</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Interactive Dialogue Workbench */}
      <IsolatedUploadDialogue initialMode="embedded" />
    </div>
  );
}
