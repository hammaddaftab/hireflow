"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Briefcase,
  MapPin,
  X
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CandidateCard } from "./CandidateCard";
import { KeyboardShortcutBar } from "./KeyboardShortcutBar";
import { CandidateReviewItem, QueueFilterTab, ReviewDecision } from "../types";
import { getCityDistribution } from "../reviewQueueService";
import { Job } from "@/features/jobs/types";

export interface ReviewQueuePageProps {
  initialJob: Job;
  initialQueue: CandidateReviewItem[];
}

export function ReviewQueuePage({ initialJob, initialQueue }: ReviewQueuePageProps) {
  const [queue, setQueue] = useState<CandidateReviewItem[]>(initialQueue);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<QueueFilterTab>("all");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Existing-cities-only, count-sorted distribution (from ui-local.md)
  const cityDistribution = useMemo(() => getCityDistribution(queue), [queue]);

  const filteredQueue = useMemo(() => {
    let list = queue;

    // 1. Status Filter Tab
    switch (activeTab) {
      case "fast_clear":
        list = list.filter((item) => item.isAllBlockingConfirmed);
        break;
      case "needs_attention":
        list = list.filter((item) => !item.isAllBlockingConfirmed && !item.hasContradicted);
        break;
      case "contradicted":
        list = list.filter((item) => item.hasContradicted);
        break;
      case "all":
      default:
        break;
    }

    // 2. Flat Location Filter Menu (existing-cities-only, unspecified catches nulls)
    if (selectedCity !== null) {
      if (selectedCity === "Unspecified") {
        list = list.filter((item) => !item.candidate.identity.location.normalized?.city);
      } else {
        list = list.filter(
          (item) => item.candidate.identity.location.normalized?.city === selectedCity
        );
      }
    }

    return list;
  }, [queue, activeTab, selectedCity]);

  const activeItem = filteredQueue[activeIndex] || filteredQueue[0];

  const handleDecision = useCallback((decision: ReviewDecision) => {
    if (!activeItem) return;

    setQueue((prev) =>
      prev.map((item) =>
        item.candidate.id === activeItem.candidate.id ? { ...item, decision } : item
      )
    );

    // Auto-advance to next candidate in queue (High-velocity fast-path)
    if (activeIndex < filteredQueue.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeItem, activeIndex, filteredQueue.length]);

  const handleNext = useCallback(() => {
    if (activeIndex < filteredQueue.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeIndex, filteredQueue.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex]);

  // Keyboard navigation implementation (ui-local.md: Keyboard-first interaction model)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
        case " ":
          e.preventDefault();
          handleDecision("keep");
          break;
        case "f":
          e.preventDefault();
          handleDecision("flag");
          break;
        case "r":
          e.preventDefault();
          handleDecision("pass");
          break;
        case "arrowright":
        case "j":
          e.preventDefault();
          handleNext();
          break;
        case "arrowleft":
        case "k":
          e.preventDefault();
          handlePrev();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDecision, handleNext, handlePrev]);

  // Statistics
  const totalCount = queue.length;
  const decisionsMade = queue.filter((i) => i.decision !== "pending").length;
  const keptCount = queue.filter((i) => i.decision === "keep").length;
  const flaggedCount = queue.filter((i) => i.decision === "flag").length;
  const passedCount = queue.filter((i) => i.decision === "pass").length;
  const fastClearCount = queue.filter((i) => i.isAllBlockingConfirmed).length;
  const progressPercent = totalCount > 0 ? Math.round((decisionsMade / totalCount) * 100) : 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* Top Header & Job Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Screening Queue</span>
            <span>•</span>
            <span>Two-Layer Disclosure</span>
          </div>
          <Typography variant="headline-medium" as="h1" className="text-2xl sm:text-3xl font-bold text-on-surface">
            {initialJob.title}
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant mt-1 flex flex-wrap items-center gap-x-3 text-xs">
            <span>{initialJob.department}</span>
            <span>•</span>
            <span>{initialJob.location}</span>
            <span>•</span>
            <span className="font-mono">
              {activeItem?.blockingItems.length || 0} blocking requirements
            </span>
          </Typography>
        </div>

        {/* Minimalist High-Contrast Progress Indicator */}
        <div className="flex flex-col gap-1.5 bg-surface-container p-3 rounded-lg border border-outline-variant min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-medium text-on-surface">
            <span>Review Progress</span>
            <span className="font-semibold">{decisionsMade} of {totalCount}</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-200" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium pt-0.5">
            <span>{keptCount} Keep</span>
            <span>•</span>
            <span>{flaggedCount} Flag</span>
            <span>•</span>
            <span>{passedCount} Pass</span>
            <span>•</span>
            <span>{totalCount - decisionsMade} Pending</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Control Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab("all"); setActiveIndex(0); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-surface text-on-surface shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Candidates ({queue.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("fast_clear"); setActiveIndex(0); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "fast_clear"
                ? "bg-surface text-on-surface shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Fast-Clear Contiguous ({fastClearCount})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("needs_attention"); setActiveIndex(0); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "needs_attention"
                ? "bg-surface text-on-surface shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Needs Review ({queue.filter((i) => !i.isAllBlockingConfirmed && !i.hasContradicted).length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("contradicted"); setActiveIndex(0); }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "contradicted"
                ? "bg-surface text-on-surface shadow-xs font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Knockouts ({queue.filter((i) => i.hasContradicted).length})
          </button>
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Prev (K)</span>
          </Button>

          <span className="text-xs font-medium text-on-surface-variant px-1.5 font-mono">
            {filteredQueue.length > 0 ? `${activeIndex + 1} / ${filteredQueue.length}` : "0"}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={activeIndex >= filteredQueue.length - 1}
            className="flex items-center gap-1 text-xs"
          >
            <span>Next (J)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Flat Location Menu: Existing-Cities-Only, Count-Sorted */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs bg-surface-container-low p-2 rounded-lg border border-outline-variant">
        <span className="text-on-surface-variant font-medium flex items-center gap-1 mr-1 text-xs">
          <MapPin className="h-3.5 w-3.5 text-on-surface-variant" />
          <span>Location:</span>
        </span>

        <button
          type="button"
          onClick={() => { setSelectedCity(null); setActiveIndex(0); }}
          className={`px-2.5 py-1 rounded-md transition-colors text-xs cursor-pointer ${
            selectedCity === null
              ? "bg-on-surface text-surface font-semibold shadow-xs"
              : "bg-surface text-on-surface hover:bg-surface-container border border-outline-variant"
          }`}
        >
          All Cities ({queue.length})
        </button>

        {cityDistribution.map(({ city, count }) => {
          const isSelected = selectedCity === city;
          return (
            <button
              key={city}
              type="button"
              onClick={() => { setSelectedCity(isSelected ? null : city); setActiveIndex(0); }}
              className={`px-2.5 py-1 rounded-md transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                isSelected
                  ? "bg-on-surface text-surface font-semibold shadow-xs"
                  : "bg-surface text-on-surface hover:bg-surface-container border border-outline-variant"
              }`}
            >
              <span>{city}</span>
              <span className={`text-[11px] font-mono ${isSelected ? "opacity-80" : "text-on-surface-variant"}`}>
                ({count})
              </span>
            </button>
          );
        })}

        {selectedCity !== null && (
          <button
            type="button"
            onClick={() => { setSelectedCity(null); setActiveIndex(0); }}
            className="ml-auto text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer px-2 py-1"
          >
            <X className="h-3 w-3" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Main Candidate Card Deck */}
      {filteredQueue.length > 0 ? (
        <div className="space-y-3.5">
          {filteredQueue.map((item, idx) => (
            <div
              key={item.candidate.id}
              onClick={() => setActiveIndex(idx)}
              className="cursor-pointer"
            >
              <CandidateCard
                item={item}
                isActive={idx === activeIndex}
                onDecision={(dec) => {
                  setActiveIndex(idx);
                  handleDecision(dec);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center border border-dashed border-outline-variant">
          <Typography variant="body-large" className="text-on-surface font-semibold">
            No candidates match the current filters.
          </Typography>
          <Typography variant="body-medium" className="text-on-surface-variant mt-1 text-xs">
            Clear the location filter or reset tabs to view all applicants.
          </Typography>
          <div className="flex justify-center gap-2 mt-4">
            {selectedCity && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCity(null)}
              >
                Clear Location Filter
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setActiveTab("all"); setSelectedCity(null); }}
            >
              Reset All Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Fixed Keyboard Shortcut Bar */}
      <div className="sticky bottom-4 z-20">
        <KeyboardShortcutBar />
      </div>
    </div>
  );
}
