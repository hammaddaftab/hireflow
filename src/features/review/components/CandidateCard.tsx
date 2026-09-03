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
  HelpCircle,
  AlertCircle,
  Github,
  Linkedin,
  Gitlab,
  Globe,
  Twitter,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { BlockingStrip } from "./BlockingStrip";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { CandidateReviewItem, ReviewDecision } from "../types";

export interface CandidateCardProps {
  item: CandidateReviewItem;
  isActive: boolean;
  onDecision: (decision: ReviewDecision) => void;
}

export function CandidateCard({ item, isActive, onDecision }: CandidateCardProps) {
  const [selectedBlockingId, setSelectedBlockingId] = useState<string | null>(null);
  const [isLayer2Expanded, setIsLayer2Expanded] = useState(false);

  const { candidate, blockingItems } = item;
  const currentRole = candidate.work_history.entries[0];
  const education = candidate.education.entries[0];

  const normalizedCity = candidate.identity.location.normalized?.city || "Unspecified";
  const rawLocation = candidate.identity.location.raw || "Not stated in resume";

  const handleSelectBlockingItem = (itemId: string) => {
    setSelectedBlockingId(itemId);
    setIsLayer2Expanded(true);
  };

  const handleToggleLayer2 = () => {
    if (!isLayer2Expanded) {
      setSelectedBlockingId(blockingItems[0]?.id || null);
      setIsLayer2Expanded(true);
    } else {
      setIsLayer2Expanded(false);
    }
  };

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
      className={`p-5 transition-all duration-150 ${
        isActive
          ? "ring-2 ring-primary border-primary bg-surface shadow-sm"
          : "border-outline-variant bg-surface hover:border-outline"
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-bold tracking-tight text-on-surface">
              {candidate.identity.name}
            </h3>

            {/* Normalized City Badge */}
            <Tooltip
              content={
                <div className="text-xs space-y-1 max-w-xs">
                  <div className="font-semibold text-on-surface">Location Evidence</div>
                  <div className="text-on-surface-variant">
                    Normalized: <strong className="text-on-surface">{normalizedCity}</strong>
                    {candidate.identity.location.normalized?.province && `, ${candidate.identity.location.normalized.province}`}
                  </div>
                  <div className="text-on-surface-variant text-[11px] italic mt-1 border-t border-outline-variant pt-1">
                    Raw document text: &ldquo;{rawLocation}&rdquo;
                  </div>
                </div>
              }
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant cursor-help">
                <MapPin className="h-3 w-3 text-on-surface-variant" />
                <span>{normalizedCity}</span>
              </span>
            </Tooltip>

            {/* Links row */}
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
                        className="h-6 w-6 rounded border border-outline-variant bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors cursor-pointer"
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

            {item.isAllBlockingConfirmed && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                All-Clear Fast-Path
              </span>
            )}
          </div>

          {/* Subtitle / Metadata */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-on-surface-variant">
            {currentRole && (
              <span className="flex items-center gap-1 font-medium text-on-surface">
                <Briefcase className="h-3.5 w-3.5 text-on-surface-variant" />
                {currentRole.title} • {currentRole.employer}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-on-surface-variant" />
              {item.verifiedYearsExperience} yrs verified exp
            </span>

            {education && (
              <span className="text-on-surface-variant">
                {education.degree_level.raw} ({education.institution.raw})
              </span>
            )}

            <span className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/70">
              <FileText className="h-3 w-3" />
              {candidate.source_document.filename}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-start">
          <Button
            variant={item.decision === "keep" ? "primary" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDecision("keep");
            }}
            className="flex items-center gap-1 text-xs font-medium"
            aria-label="Keep candidate"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Keep (A)</span>
          </Button>

          <Button
            variant={item.decision === "flag" ? "primary" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDecision("flag");
            }}
            className="flex items-center gap-1 text-xs font-medium"
            aria-label="Flag candidate for follow-up"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Flag (F)</span>
          </Button>

          <Button
            variant={item.decision === "pass" ? "secondary" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDecision("pass");
            }}
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-rose-600 dark:hover:text-rose-400"
            aria-label="Pass candidate"
          >
            <X className="h-3.5 w-3.5" />
            <span>Pass (R)</span>
          </Button>
        </div>
      </div>

      {/* LAYER 1: The 2-Second Glance Strip + Secondary Badges */}
      <div className="mt-4 pt-3 border-t border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-low p-2.5 rounded-lg border">
        {/* Blocking Requirement Strip */}
        <BlockingStrip
          items={blockingItems}
          selectedItemId={isLayer2Expanded ? selectedBlockingId : null}
          onSelectItem={handleSelectBlockingItem}
        />

        {/* Secondary Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Orphan Skills Badge */}
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs">
                <div className="font-semibold text-on-surface">Orphan Skills Checklist:</div>
                <div className="text-on-surface-variant text-[11px]">
                  Declared in skills list, but not corroborated with action verbs in work history:
                </div>
                <div className="text-[11px] font-mono text-on-surface mt-1">
                  {item.orphanSkillsList.slice(0, 6).join(", ") || "None"}
                  {item.orphanSkillsList.length > 6 && ` +${item.orphanSkillsList.length - 6} more`}
                </div>
              </div>
            }
          >
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-surface text-on-surface-variant border border-outline-variant cursor-help">
              <AlertCircle className="h-3.5 w-3.5 text-on-surface-variant" />
              <span>orphan skills:</span>
              <strong className="font-semibold text-on-surface">{item.orphanSkillsCount}</strong>
            </span>
          </Tooltip>

          {/* Logistics Not Stated Badge */}
          <Tooltip
            content={
              <div className="text-xs space-y-1 max-w-xs">
                <div className="font-semibold text-on-surface">Unstated Logistics Checklist:</div>
                <div className="text-on-surface-variant text-[11px]">
                  Unstated candidate logistics for recruiter follow-up:
                </div>
                <ul className="list-disc list-inside text-on-surface-variant text-[11px] mt-1 space-y-0.5">
                  {item.logisticsNotStatedList.map((itemStr, idx) => (
                    <li key={idx}>{itemStr}</li>
                  ))}
                  {item.logisticsNotStatedList.length === 0 && <li>All logistics stated</li>}
                </ul>
              </div>
            }
          >
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-surface text-on-surface-variant border border-outline-variant cursor-help">
              <HelpCircle className="h-3.5 w-3.5 text-on-surface-variant" />
              <span>logistics not_stated:</span>
              <strong className="font-semibold text-on-surface">{item.logisticsNotStatedCount}</strong>
            </span>
          </Tooltip>

          {/* Toggle Layer 2 Details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLayer2();
            }}
            className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 h-7 px-2"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isLayer2Expanded ? "Hide" : "Evidence (E)"}</span>
            {isLayer2Expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* LAYER 2: On-Demand Evidence Drawer */}
      {isLayer2Expanded && (
        <EvidenceDrawer
          items={blockingItems}
          selectedItemId={selectedBlockingId}
          onSelectItem={(id) => setSelectedBlockingId(id)}
          onClose={() => setIsLayer2Expanded(false)}
        />
      )}
    </Card>
  );
}
