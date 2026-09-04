"use client";

import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  FileText, 
  Check, 
  X, 
  Bookmark, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Github,
  Linkedin,
  Gitlab,
  Globe,
  Twitter,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { BlockingStrip } from "./BlockingStrip";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { CandidateReviewItem } from "../types";
import type { ReviewDecision } from "@/entities/review";

export interface CandidateCardProps {
  item: CandidateReviewItem;
  isActive: boolean;
  onDecision: (decision: ReviewDecision) => void;
  hideActionButtons?: boolean;
  isLayer2Expanded?: boolean;
  onToggleLayer2?: () => void;
  expandedFullHeight?: boolean;
}

function formatDegreeName(deg: string | null): string {
  if (!deg) return "Degree";
  const str = deg.replace("_", " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function CandidateCard({
  item,
  isActive,
  onDecision,
  hideActionButtons = false,
  isLayer2Expanded: controlledLayer2Expanded,
  onToggleLayer2,
  expandedFullHeight = false,
}: CandidateCardProps) {
  const [internalLayer2Expanded, setInternalLayer2Expanded] = useState(false);
  const [isEducationExpanded, setIsEducationExpanded] = useState(false);

  const isLayer2Expanded =
    controlledLayer2Expanded !== undefined ? controlledLayer2Expanded : internalLayer2Expanded;

  const toggleLayer2 = onToggleLayer2 || (() => setInternalLayer2Expanded(!internalLayer2Expanded));

  const { candidate } = item;
  const currentRole = candidate.work_history.entries[0];
  const primaryEducation = candidate.education.entries[0];
  const otherEducationCount = candidate.education.entries.length - 1;

  const normalizedCity = candidate.identity.location.normalized?.city || "Unspecified";
  const rawLocation = candidate.identity.location.raw || "Not stated in resume";

  const getPlatformIcon = (platform: string | null) => {
    switch (platform?.toLowerCase()) {
      case "github":
        return <Github className="h-3.5 w-3.5" />;
      case "linkedin":
        return <Linkedin className="h-3.5 w-3.5" />;
      case "gitlab":
        return <Gitlab className="h-3.5 w-3.5" />;
      case "portfolio":
        return <Globe className="h-3.5 w-3.5" />;
      case "twitter":
        return <Twitter className="h-3.5 w-3.5" />;
      case "other":
      default:
        return <ExternalLink className="h-3.5 w-3.5" />;
    }
  };

  const getDecisionBadge = () => {
    switch (item.decision) {
      case "keep":
        return <Badge variant="success">Keep</Badge>;
      case "flag":
        return <Badge variant="warning">Flagged</Badge>;
      case "pass":
        return <Badge variant="dealbreaker">Passed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card
      className={`p-6 transition-all duration-200 ${
        expandedFullHeight
          ? "h-full rounded-none border-0 border-x border-outline-variant/50 dark:border-outline-variant/30 overflow-y-auto custom-scrollbar bg-surface shadow-2xl"
          : `rounded-2xl border border-outline-variant/50 dark:border-outline-variant/30 shadow-sm ${
              isActive
                ? "border-l-2 border-l-primary/80 bg-surface"
                : "bg-surface/90 hover:bg-surface"
            }`
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-xl font-bold tracking-tight text-on-surface">
              {candidate.identity.name}
            </h3>

            {/* Normalized City Pill (Tonal Island) */}
            <Tooltip
              content={
                <div className="text-xs space-y-1 max-w-xs">
                  <div className="font-semibold text-on-surface">Location Evidence</div>
                  <div className="text-on-surface-variant">
                    Normalized: <strong className="text-on-surface">{normalizedCity}</strong>
                    {candidate.identity.location.normalized?.province && `, ${candidate.identity.location.normalized.province}`}
                  </div>
                  <div className="text-on-surface-variant text-[11px] italic mt-1 pt-1 border-t border-outline-variant/60">
                    Raw document text: &ldquo;{rawLocation}&rdquo;
                  </div>
                </div>
              }
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface border-0 cursor-help">
                <MapPin className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                <span>{normalizedCity}</span>
              </span>
            </Tooltip>

            {/* Links row (Tonal Icon Pills) */}
            {candidate.identity.links.length > 0 && (
              <div className="flex items-center gap-1">
                {candidate.identity.links.map((link, idx) => {
                  const platformName = link.platform.normalized || link.platform.raw || "Link";
                  return (
                    <Tooltip
                      key={idx}
                      content={
                        <div className="text-xs">
                          <span className="font-semibold capitalize">{platformName}</span>: {link.address}
                        </div>
                      }
                    >
                      <a
                        href={link.address}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 w-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer border-0"
                        aria-label={`Open ${platformName} profile`}
                      >
                        {getPlatformIcon(link.platform.normalized)}
                      </a>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {getDecisionBadge()}
          </div>

          {/* Subtitle / Role & Experience */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3.5 text-xs text-on-surface-variant">
            {currentRole && (
              <span className="flex items-center gap-1.5 font-semibold text-on-surface">
                <Briefcase className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                {currentRole.title} • {currentRole.employer}
              </span>
            )}

            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
              {item.verifiedYearsExperience} yrs verified exp
            </span>

            <span className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/70">
              <FileText className="h-3 w-3 shrink-0" />
              {candidate.source_document.filename}
            </span>
          </div>

          {/* Secondary Detail Area: Compact Education Line (Tonal Pill Capsule) */}
          {primaryEducation && (
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 p-1 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs text-on-surface-variant flex-wrap transition-colors">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEducationExpanded(!isEducationExpanded);
                  }}
                  className="inline-flex items-center gap-1.5 hover:text-on-surface transition-colors cursor-pointer group text-left border-0"
                  title="Click to view education evidence and grades"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                  <span className="font-semibold text-on-surface group-hover:underline">
                    {formatDegreeName(primaryEducation.degree_level.normalized || primaryEducation.degree_level.raw)}, {primaryEducation.field.normalized || primaryEducation.field.raw}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[200px] sm:max-w-xs text-on-surface-variant">
                    {primaryEducation.institution.normalized || primaryEducation.institution.raw}
                  </span>
                </button>

                {/* In Progress Tag */}
                {primaryEducation.is_current && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 border-0 shrink-0">
                    In Progress
                  </span>
                )}

                {/* Multiple entries affordance (+N more) */}
                {otherEducationCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEducationExpanded(!isEducationExpanded);
                    }}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest border-0 shrink-0 cursor-pointer transition-colors"
                  >
                    +{otherEducationCount} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Expanded Education Evidence Drawer (Layer 2 On-Demand Tonal Sheet) */}
          {isEducationExpanded && (
            <div className="mt-3 p-4 rounded-2xl bg-surface-container space-y-2.5 text-xs border-0">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-on-surface-variant" />
                  <span>Education Evidence (Verbatim Resume Text)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEducationExpanded(false)}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2">
                {candidate.education.entries.map((entry, idx) => (
                  <div key={idx} className="p-3 bg-surface rounded-xl shadow-2xs space-y-1.5 border-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="font-bold text-on-surface">
                        &ldquo;{entry.degree_level.raw}&rdquo; in &ldquo;{entry.field.raw}&rdquo;
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                        <span>{entry.start_date} – {entry.is_current ? "Present" : entry.end_date || "N/A"}</span>
                        {entry.is_current && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 border-0">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-on-surface-variant">
                      Institution: <span className="font-semibold text-on-surface">&ldquo;{entry.institution.raw}&rdquo;</span>
                    </div>

                    {entry.grade && (
                      <div className="text-[11px] font-mono text-primary font-bold pt-0.5">
                        Grade / GPA: {entry.grade}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons (Libadwaita Tonal Island Buttons) - Hidden when hosted in bottom videogame HUD */}
        {!hideActionButtons && (
          <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
            <Button
              variant={item.decision === "keep" ? "primary" : "secondary"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDecision("keep");
              }}
              className={`h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl border-0 shadow-2xs ${
                item.decision === "keep"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-surface-container text-on-surface hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-300"
              }`}
              aria-label="Keep candidate"
            >
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>Keep</span>
            </Button>

            <Button
              variant={item.decision === "flag" ? "primary" : "secondary"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDecision("flag");
              }}
              className={`h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl border-0 shadow-2xs ${
                item.decision === "flag"
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-surface-container text-on-surface hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-300"
              }`}
              aria-label="Flag candidate for follow-up"
            >
              <Bookmark className="h-3.5 w-3.5 shrink-0" />
              <span>Flag</span>
            </Button>

            <Button
              variant={item.decision === "pass" ? "secondary" : "ghost"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDecision("pass");
              }}
              className={`h-8 px-3.5 gap-1.5 text-xs font-bold rounded-xl border-0 shadow-2xs ${
                item.decision === "pass"
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-surface-container text-on-surface-variant hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-300"
              }`}
              aria-label="Pass candidate"
            >
              <X className="h-3.5 w-3.5 shrink-0" />
              <span>Pass</span>
            </Button>
          </div>
        )}
      </div>

      {/* LAYER 1: Category-Grouped Evidence Display with Exception Collapse */}
      <div className="mt-5 p-4 rounded-2xl bg-surface-container space-y-3 border-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          {/* Category Rows (Experience, Skills, Education, Logistics) */}
          <div className="flex-1">
            <BlockingStrip item={item} />
          </div>

          {/* Action & Disclosure Controls */}
          <div className="shrink-0 self-end md:self-start pt-0.5">
            {/* Toggle Layer 2 Details */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleLayer2();
              }}
              className="h-8 px-3 gap-1.5 text-xs font-bold rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-0 transition-colors"
            >
              <Eye className="h-3.5 w-3.5 shrink-0 text-on-surface-variant" />
              <span>{isLayer2Expanded ? "Hide" : "Evidence"}</span>
              {isLayer2Expanded ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0 text-on-surface-variant" />}
            </Button>
          </div>
        </div>
      </div>

      {/* LAYER 2: On-Demand Categorical Evidence Drawer */}
      {isLayer2Expanded && (
        <EvidenceDrawer
          item={item}
          onClose={toggleLayer2}
        />
      )}
    </Card>
  );
}
