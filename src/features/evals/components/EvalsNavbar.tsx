"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Layers, Briefcase, GraduationCap, User, FileText, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Top navigation bar for the AI Stress Test route with aspect tabs
export function EvalsNavbar() {
  const pathname = usePathname();

  const isExperience = pathname === "/evals/experience" || pathname === "/evals";
  const isEducation = pathname === "/evals/education";
  const isIdentity = pathname === "/evals/identity";
  const isPdfExtract = pathname === "/evals/pdf-extract";
  const isNormalization = pathname === "/evals/normalization";

  return (
    <div className="space-y-4 border-b border-outline-variant/40 pb-4">
      {/* Top breadcrumb & external shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/review"
            className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Review Queue</span>
          </Link>
          <span className="text-on-surface-variant/40">•</span>
          <span className="text-xs uppercase font-mono text-primary font-semibold">
            AI Extraction Benchmarks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/uploads/sandbox">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl text-xs gap-1.5 font-semibold"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Upload Sandbox</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Aspect tab navigation */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <Link
          href="/evals/experience"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            isExperience
              ? "bg-primary text-on-primary border-primary shadow-xs"
              : "bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline-variant/40"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Work Experience</span>
        </Link>

        <Link
          href="/evals/education"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            isEducation
              ? "bg-primary text-on-primary border-primary shadow-xs"
              : "bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline-variant/40"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Education</span>
        </Link>

        <Link
          href="/evals/identity"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            isIdentity
              ? "bg-primary text-on-primary border-primary shadow-xs"
              : "bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline-variant/40"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Identity</span>
        </Link>

        <Link
          href="/evals/normalization"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            isNormalization
              ? "bg-primary text-on-primary border-primary shadow-xs"
              : "bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline-variant/40"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Normalization Lab</span>
        </Link>

        <Link
          href="/evals/pdf-extract"
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            isPdfExtract
              ? "bg-primary text-on-primary border-primary shadow-xs"
              : "bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline-variant/40"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>PDF Text Extraction</span>
        </Link>
      </div>
    </div>
  );
}
