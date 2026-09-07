"use client";
// TODO: this isolated ui testing component has drifted from main
// due to some padding/border changes i have applied directly to main 
// therefore it either must be removed or made consistent later on 
// when we need to test ui independetly - it still serves testing other props
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Building2,
  MapPin,
  GraduationCap,
  FileText,
  ArrowRight,
  Inbox,
  RotateCcw,
  Sliders,
  Check,
  X,
  Play,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import type { Job } from "@/entities/job";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { CandidateReviewItem } from "@/features/review/types";
import { buildReviewQueue } from "@/features/review/core/services/reviewQueueService";
import { MOCK_CANDIDATES } from "@/lib/mockCandidates";

export interface IsolatedUploadDialogueProps {
  initialMode?: "modal" | "embedded";
  onClose?: () => void;
}

// Mock Jobs for Sandbox testing with schema-compliant types
const SAMPLE_JOBS: Job[] = [
  {
    id: "job-sample-1",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "San Francisco, CA (Hybrid)",
    employmentType: "full-time",
    description: null,
    seniority_level: null,
    skills_required: [
      { active: true, skill: "typescript", blocking: true },
      { active: true, skill: "react", blocking: true },
      { active: true, skill: "node.js", blocking: true },
    ],
    skills_preferred: [
      { active: true, skill: "next.js", blocking: false },
    ],
    min_experience: {
      active: true,
      years: 5,
      blocking: true,
    },
    education_min: {
      active: true,
      degree_level: "bachelors",
      field: "Computer Science",
      blocking: true,
    },
    location_requirement: {
      active: true,
      city: "San Francisco",
      province: "CA",
      blocking: false,
    },
    work_mode: {
      active: true,
      mode: "hybrid",
      blocking: true,
    },
    compensation_band: {
      active: true,
      min: 130000,
      max: 180000,
      currency: "USD",
      blocking: false,
    },
    max_notice_period: {
      active: true,
      value: 30,
      unit: "days",
      blocking: false,
    },
    status: "active",
    createdAt: new Date("2026-08-28T10:00:00.000Z"),
    updatedAt: new Date("2026-08-28T10:00:00.000Z"),
  },
  {
    id: "job-sample-2",
    title: "Staff AI Research Scientist",
    department: "Research",
    location: "Remote",
    employmentType: "full-time",
    description: null,
    seniority_level: null,
    skills_required: [
      { active: true, skill: "pytorch", blocking: true },
      { active: true, skill: "transformers", blocking: true },
    ],
    skills_preferred: [],
    min_experience: {
      active: true,
      years: 6,
      blocking: true,
    },
    education_min: {
      active: true,
      degree_level: "doctorate",
      field: "Computer Science",
      blocking: true,
    },
    location_requirement: {
      active: false,
      blocking: false,
    },
    work_mode: {
      active: true,
      mode: "remote",
      blocking: true,
    },
    compensation_band: {
      active: true,
      min: 200000,
      max: 270000,
      currency: "USD",
      blocking: false,
    },
    max_notice_period: {
      active: true,
      value: 60,
      unit: "days",
      blocking: false,
    },
    status: "active",
    createdAt: new Date("2026-08-28T10:00:00.000Z"),
    updatedAt: new Date("2026-08-28T10:00:00.000Z"),
  },
  {
    id: "job-sample-3",
    title: "Platform Infrastructure Architect",
    department: "Platform",
    location: "New York, NY",
    employmentType: "full-time",
    description: null,
    seniority_level: null,
    skills_required: [
      { active: true, skill: "distributed systems", blocking: true },
      { active: true, skill: "kubernetes", blocking: true },
    ],
    skills_preferred: [],
    min_experience: {
      active: true,
      years: 7,
      blocking: true,
    },
    education_min: {
      active: true,
      degree_level: "bachelors",
      field: "Computer Science",
      blocking: true,
    },
    location_requirement: {
      active: true,
      city: "New York",
      province: "NY",
      blocking: false,
    },
    work_mode: {
      active: true,
      mode: "onsite",
      blocking: true,
    },
    compensation_band: {
      active: true,
      min: 170000,
      max: 230000,
      currency: "USD",
      blocking: false,
    },
    max_notice_period: {
      active: true,
      value: 30,
      unit: "days",
      blocking: false,
    },
    status: "active",
    createdAt: new Date("2026-08-28T10:00:00.000Z"),
    updatedAt: new Date("2026-08-28T10:00:00.000Z"),
  },
];

export type StackingDirection =
  | "horizontal-spread"
  | "horizontal-right"
  | "horizontal-left"
  | "vertical-up"
  | "vertical-down";

// Strictly at most 3 cards rendered in DOM
function getVisibleItems<T>(
  items: T[],
  activeIndex: number,
  direction: StackingDirection
): { item: T; originalIndex: number }[] {
  const total = items.length;
  if (total === 0) return [];
  if (total <= 3) {
    return items.map((item, index) => ({ item, originalIndex: index }));
  }

  // Symmetrical horizontal spread
  if (direction === "horizontal-spread") {
    if (activeIndex === 0) {
      return [
        { item: items[0], originalIndex: 0 },
        { item: items[1], originalIndex: 1 },
        { item: items[2], originalIndex: 2 },
      ];
    }
    if (activeIndex === total - 1) {
      return [
        { item: items[total - 3], originalIndex: total - 3 },
        { item: items[total - 2], originalIndex: total - 2 },
        { item: items[total - 1], originalIndex: total - 1 },
      ];
    }
    return [
      { item: items[activeIndex - 1], originalIndex: activeIndex - 1 },
      { item: items[activeIndex], originalIndex: activeIndex },
      { item: items[activeIndex + 1], originalIndex: activeIndex + 1 },
    ];
  }

  // Leftward cascade
  if (direction === "horizontal-left") {
    if (activeIndex === 0) {
      return [
        { item: items[0], originalIndex: 0 },
        { item: items[1], originalIndex: 1 },
        { item: items[2], originalIndex: 2 },
      ];
    }
    if (activeIndex >= 2) {
      return [
        { item: items[activeIndex - 2], originalIndex: activeIndex - 2 },
        { item: items[activeIndex - 1], originalIndex: activeIndex - 1 },
        { item: items[activeIndex], originalIndex: activeIndex },
      ];
    }
    return [
      { item: items[0], originalIndex: 0 },
      { item: items[1], originalIndex: 1 },
      { item: items[2], originalIndex: 2 },
    ];
  }

  // Forward cascade (horizontal-right, vertical-up, vertical-down)
  if (activeIndex <= total - 3) {
    return [
      { item: items[activeIndex], originalIndex: activeIndex },
      { item: items[activeIndex + 1], originalIndex: activeIndex + 1 },
      { item: items[activeIndex + 2], originalIndex: activeIndex + 2 },
    ];
  }
  if (activeIndex === total - 2) {
    return [
      { item: items[activeIndex - 1], originalIndex: activeIndex - 1 },
      { item: items[activeIndex], originalIndex: activeIndex },
      { item: items[activeIndex + 1], originalIndex: activeIndex + 1 },
    ];
  }
  return [
    { item: items[total - 3], originalIndex: total - 3 },
    { item: items[total - 2], originalIndex: total - 2 },
    { item: items[total - 1], originalIndex: total - 1 },
  ];
}

export function IsolatedUploadDialogue({
  initialMode,
  onClose,
}: IsolatedUploadDialogueProps = {}) {
  // Modal visibility for action overlay popup
  const [isModalOpen, setIsModalOpen] = useState(initialMode === "modal");

  // Selection state inside the action popup
  const [selectedJobId, setSelectedJobId] = useState<string>("job-sample-1");
  const [mockFiles] = useState<string[]>([
    "hamza_tariq_fullstack.pdf",
    "elena_rostova_ai.pdf",
    "liam_davis_mechanical.pdf",
  ]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([
    "hamza_tariq_fullstack.pdf",
    "elena_rostova_ai.pdf",
    "liam_davis_mechanical.pdf",
  ]);

  // Candidate cards in the main outer feedback deck
  const [candidateList, setCandidateList] = useState<ParsedCandidateProfile[]>(
    MOCK_CANDIDATES.slice(0, 4)
  );
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Live extraction simulation state in main outer window
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);

  // Stacking parameters for interactive tuning
  const [stackDirection, setStackDirection] = useState<StackingDirection>("horizontal-spread");
  const [offsetDistance, setOffsetDistance] = useState<number>(48);
  const [scaleDelta, setScaleDelta] = useState<number>(0.04);
  const [enableTilt, setEnableTilt] = useState<boolean>(false);
  const [enableDrag, setEnableDrag] = useState<boolean>(true);
  const [stiffness, setStiffness] = useState<number>(280);
  const [damping, setDamping] = useState<number>(28);

  const currentJob = useMemo(() => {
    return SAMPLE_JOBS.find((j) => j.id === selectedJobId) || SAMPLE_JOBS[0];
  }, [selectedJobId]);

  // Evaluated candidate review items
  const candidateReviewItems: CandidateReviewItem[] = useMemo(() => {
    if (candidateList.length === 0 || !currentJob) return [];
    return buildReviewQueue(candidateList, currentJob);
  }, [candidateList, currentJob]);

  // Max 3 rendered cards window
  const visibleCardEntries = useMemo(() => {
    return getVisibleItems(candidateReviewItems, activeCardIndex, stackDirection);
  }, [candidateReviewItems, activeCardIndex, stackDirection]);

  // Spring physics configuration
  const currentSpring = useMemo(() => ({
    type: "spring" as const,
    stiffness,
    damping,
    mass: 0.85,
  }), [stiffness, damping]);

  // Navigation handlers
  const handleNext = () => {
    setActiveCardIndex((prev) => Math.min(candidateReviewItems.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setActiveCardIndex((prev) => Math.max(0, prev - 1));
  };

  // Keyboard navigation for active card deck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePrev();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNext();
      } else if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [candidateReviewItems.length, isModalOpen, onClose]);

  // Add candidate card to deck
  const handleAddCandidate = () => {
    const nextCandidate = MOCK_CANDIDATES[candidateList.length % MOCK_CANDIDATES.length];
    const copy: ParsedCandidateProfile = {
      ...nextCandidate,
      id: `${nextCandidate.id}_${Date.now()}`,
      identity: {
        ...nextCandidate.identity,
        name: `${nextCandidate.identity.name} #${candidateList.length + 1}`,
      },
    };
    setCandidateList((prev) => {
      const updated = [...prev, copy];
      setActiveCardIndex(updated.length - 1);
      return updated;
    });
  };

  // Remove top candidate card
  const handleRemoveCandidate = () => {
    if (candidateList.length <= 1) return;
    setCandidateList((prev) => {
      const updated = prev.slice(0, -1);
      setActiveCardIndex(Math.min(activeCardIndex, updated.length - 1));
      return updated;
    });
  };

  // Run live simulation in the main outer window
  const runLiveSimulation = async () => {
    setIsSimulating(true);
    setCandidateList([]);
    setActiveCardIndex(0);

    const sourceCandidates = MOCK_CANDIDATES.slice(0, Math.max(selectedFiles.length, 3));

    for (let i = 0; i < sourceCandidates.length; i++) {
      setSimulationIndex(i);
      await new Promise((r) => setTimeout(r, 900));

      const newCand = sourceCandidates[i];
      setCandidateList((prev) => {
        const updated = [...prev, newCand];
        setActiveCardIndex(updated.length - 1);
        return updated;
      });
    }

    await new Promise((r) => setTimeout(r, 300));
    setIsSimulating(false);
  };

  // Proceed button click handler inside action modal (closes modal and runs extraction in outer window)
  const handleModalProceed = () => {
    if (selectedFiles.length === 0 || !selectedJobId) return;
    setIsModalOpen(false);
    runLiveSimulation();
  };

  // Horizontal card gesture drag handler
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!enableDrag) return;
    const isHorizontal = stackDirection.startsWith("horizontal");
    if (isHorizontal) {
      if (info.offset.x < -40) handleNext();
      else if (info.offset.x > 40) handlePrev();
    } else {
      if (info.offset.y < -40) handleNext();
      else if (info.offset.y > 40) handlePrev();
    }
  };

  const isHorizontal = stackDirection.startsWith("horizontal");

  return (
    <div className="space-y-6">
      {/* Workbench Parameter Tuning Panel */}
      <Card className="p-5 rounded-2xl bg-surface border border-outline-variant/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sliders className="h-3.5 w-3.5" />
            </div>
            <div>
              <Typography variant="title-medium" className="text-on-surface font-bold text-xs">
                Live Stacking & Direction Controls (Max 3 Rendered in DOM)
              </Typography>
              <p className="text-[11px] text-on-surface-variant">
                Total candidates: <strong className="text-on-surface">{candidateReviewItems.length}</strong> • Rendered in DOM: <strong className="text-primary">{visibleCardEntries.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStackDirection("horizontal-spread");
                setOffsetDistance(48);
                setScaleDelta(0.04);
                setEnableTilt(false);
                setEnableDrag(true);
                setStiffness(280);
                setDamping(28);
                setActiveCardIndex(0);
                setCandidateList(MOCK_CANDIDATES.slice(0, 4));
              }}
              className="h-7 px-2.5 rounded-lg text-xs gap-1"
              title="Reset parameters to defaults"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Defaults</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={runLiveSimulation}
              disabled={isSimulating}
              className="h-7 px-3 rounded-lg text-xs font-semibold gap-1.5"
              title="Re-run simulation in outer window"
            >
              <Play className="h-3 w-3" />
              <span>Simulate Flow</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-7 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-xs"
              title="Open action-only overlay popup"
            >
              <Sparkles className="h-3 w-3" />
              <span>Open Ingest Popup</span>
            </Button>
          </div>
        </div>

        {/* Direction Selector Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Stacking Direction:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "horizontal-spread", label: "Horizontal Spread (Symmetrical)" },
              { id: "horizontal-right", label: "Horizontal Right (Cascade)" },
              { id: "horizontal-left", label: "Horizontal Left (Cascade)" },
              { id: "vertical-up", label: "Vertical Upward" },
              { id: "vertical-down", label: "Vertical Downward" },
            ].map((d) => {
              const isSelected = stackDirection === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setStackDirection(d.id as StackingDirection)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-on-primary border-primary shadow-xs"
                      : "bg-surface-container border-outline-variant/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
          {/* Projection Offset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-on-surface font-medium">
              <span>{isHorizontal ? "Horizontal Offset:" : "Vertical Offset:"}</span>
              <span className="font-mono font-bold text-primary">{offsetDistance}px</span>
            </div>
            <input
              type="range"
              min={15}
              max={90}
              step={2}
              value={offsetDistance}
              onChange={(e) => setOffsetDistance(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Scale Delta */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-on-surface font-medium">
              <span>Depth Scale Factor:</span>
              <span className="font-mono font-bold text-primary">{scaleDelta}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.08}
              step={0.005}
              value={scaleDelta}
              onChange={(e) => setScaleDelta(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Spring Stiffness */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-on-surface font-medium">
              <span>Spring Stiffness:</span>
              <span className="font-mono font-bold text-primary">{stiffness}</span>
            </div>
            <input
              type="range"
              min={140}
              max={400}
              step={10}
              value={stiffness}
              onChange={(e) => setStiffness(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Spring Damping */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-on-surface font-medium">
              <span>Spring Damping:</span>
              <span className="font-mono font-bold text-primary">{damping}</span>
            </div>
            <input
              type="range"
              min={16}
              max={40}
              step={2}
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Card Counter & Toggles Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-outline-variant/30">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTilt}
                onChange={(e) => setEnableTilt(e.target.checked)}
                className="rounded accent-primary"
              />
              <span className="text-on-surface font-medium">Physical Tilt (±1.4°)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableDrag}
                onChange={(e) => setEnableDrag(e.target.checked)}
                className="rounded accent-primary"
              />
              <span className="text-on-surface font-medium">
                Swipe Gestures ({isHorizontal ? "Horizontal X" : "Vertical Y"})
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveCandidate}
              disabled={candidateList.length <= 1}
              className="h-7 px-2.5 rounded-lg text-xs gap-1"
              title="Remove candidate card"
            >
              <Minus className="h-3 w-3" />
              <span>Card ({candidateList.length})</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddCandidate}
              className="h-7 px-2.5 rounded-lg text-xs gap-1"
              title="Add candidate card"
            >
              <Plus className="h-3 w-3" />
              <span>Card ({candidateList.length})</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Outer Window Feedback Deck (Consistent with UploadsPage) */}
      <div className="rounded-2xl border border-outline-variant/70 bg-surface shadow-md p-6 space-y-4">
        {/* Progress Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-3">
            {isSimulating ? (
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-on-surface">
                  {isSimulating
                    ? `Extracting Candidate Profiles (${simulationIndex + 1}/${selectedFiles.length})`
                    : `Extraction Complete (${candidateReviewItems.length} candidate${candidateReviewItems.length === 1 ? "" : "s"} staged)`}
                </span>
                <Badge variant="neutral" className="text-[10px] py-0 px-2 font-mono">
                  Target: {currentJob?.title}
                </Badge>
              </div>
              <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                {isSimulating
                  ? `Parsing multi-aspect profile from ${selectedFiles[simulationIndex] || "document"}...`
                  : isHorizontal
                  ? "Drag cards left/right or use arrow keys to cycle through candidates."
                  : "Drag cards up/down or use arrow keys to cycle through candidates."}
              </p>
            </div>
          </div>

          {/* Deck Navigation Controls */}
          {candidateReviewItems.length > 1 && (
            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <span className="text-[11px] font-mono text-on-surface-variant">
                Card <strong>{activeCardIndex + 1}</strong> of <strong>{candidateReviewItems.length}</strong>
              </span>
              <div className="inline-flex items-center border border-outline-variant/60 rounded-lg overflow-hidden bg-surface-container">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={activeCardIndex === 0}
                  className="p-1.5 hover:bg-surface-container-high disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-on-surface-variant"
                  title="Previous candidate (Left / Up arrow)"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={activeCardIndex === candidateReviewItems.length - 1}
                  className="p-1.5 hover:bg-surface-container-high disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-on-surface-variant"
                  title="Next candidate (Right / Down arrow)"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stacked Deck Viewport Area */}
        <div className="relative flex items-center justify-center overflow-hidden py-4 min-h-[420px]">
          {candidateReviewItems.length === 0 && isSimulating && (
            <div className="text-center space-y-3 py-12">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center animate-spin">
                <RotateCcw className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-on-surface">
                Parsing document text and extracting candidate aspects...
              </p>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Target: {currentJob?.title}
              </p>
            </div>
          )}

          {/* Physical Stacked Deck Area — exactly max 3 cards */}
          {candidateReviewItems.length > 0 && (
            <div className="relative w-full max-w-xl h-[390px] flex items-center justify-center">
              <AnimatePresence mode="sync">
                {visibleCardEntries.map(({ item, originalIndex }) => {
                  const diff = originalIndex - activeCardIndex;
                  const isActive = diff === 0;

                  // Compute dynamic transforms based on active stacking direction
                  let computedX = 0;
                  let computedY = 0;

                  switch (stackDirection) {
                    case "horizontal-spread":
                    case "horizontal-right":
                      computedX = diff * offsetDistance;
                      computedY = 0;
                      break;
                    case "horizontal-left":
                      computedX = diff * -offsetDistance;
                      computedY = 0;
                      break;
                    case "vertical-up":
                      computedX = 0;
                      computedY = diff * -offsetDistance;
                      break;
                    case "vertical-down":
                      computedX = 0;
                      computedY = diff * offsetDistance;
                      break;
                  }

                  const computedScale = Math.max(0.84, 1 - Math.abs(diff) * scaleDelta);
                  const computedZIndex = 30 - Math.abs(diff);
                  const computedOpacity = Math.max(0.55, 1 - Math.abs(diff) * 0.18);
                  const computedRotate = enableTilt ? diff * (isHorizontal ? 1.4 : 0.8) : 0;

                  const { candidate } = item;
                  const currentRole = candidate.work_history.entries[0];
                  const primaryEdu = candidate.education.entries[0];
                  const locationCity =
                    candidate.identity.location.normalized?.city ||
                    candidate.identity.location.raw ||
                    "Unspecified";

                  return (
                    <motion.div
                      key={candidate.id}
                      layout
                      initial={{
                        opacity: 0,
                        x: isHorizontal ? diff * (offsetDistance + 40) : 0,
                        y: isHorizontal ? 0 : 50,
                        scale: 0.88,
                      }}
                      animate={{
                        opacity: computedOpacity,
                        x: computedX,
                        y: computedY,
                        scale: computedScale,
                        zIndex: computedZIndex,
                        rotate: computedRotate,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.82,
                        x: isHorizontal ? -100 : 0,
                        y: isHorizontal ? 0 : -50,
                      }}
                      transition={currentSpring}
                      drag={enableDrag && isActive ? (isHorizontal ? "x" : "y") : false}
                      dragConstraints={isHorizontal ? { left: 0, right: 0 } : { top: 0, bottom: 0 }}
                      dragElastic={0.25}
                      onDragEnd={handleDragEnd}
                      onClick={() => setActiveCardIndex(originalIndex)}
                      className={`absolute inset-x-0 cursor-pointer rounded-2xl border bg-surface p-6 select-none transition-shadow ${
                        isActive
                          ? "border-primary/80 ring-1 ring-primary/30 shadow-2xl"
                          : "border-outline-variant/60 shadow-lg hover:border-outline-variant hover:shadow-xl"
                      }`}
                      style={{
                        height: "370px",
                        top: "10px",
                        transformOrigin: "center center",
                      }}
                    >
                      {/* Card Interior */}
                      <div className="h-full flex flex-col justify-between pointer-events-none">
                        <div className="space-y-3">
                          {/* Card Header (Clean: Name, City, Role, Exp) */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-on-surface tracking-tight truncate">
                                  {candidate.identity.name}
                                </h3>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold py-0.5 px-2 rounded-full border border-outline-variant/60 bg-surface-container-low text-on-surface-variant shrink-0 whitespace-nowrap">
                                  <MapPin className="h-3 w-3 shrink-0 text-on-surface-variant" />
                                  <span>{locationCity}</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap pt-1.5">
                                {currentRole && (
                                  <span className="flex items-center gap-1 font-semibold text-on-surface">
                                    <Briefcase className="h-3 w-3 text-on-surface-variant shrink-0" />
                                    <span className="truncate max-w-[220px]">
                                      {currentRole.title} • {currentRole.employer}
                                    </span>
                                  </span>
                                )}

                                <span className="flex items-center gap-1 font-medium">
                                  <Building2 className="h-3 w-3 text-on-surface-variant shrink-0" />
                                  <span>{item.verifiedYearsExperience} yrs exp</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Education Info */}
                          {primaryEdu && (
                            <div className="pt-1 flex items-center gap-2 text-xs text-on-surface-variant">
                              <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">
                                {primaryEdu.degree_level.normalized || primaryEdu.degree_level.raw} in{" "}
                                {primaryEdu.field?.normalized || primaryEdu.field?.raw || "Engineering"} •{" "}
                                {primaryEdu.institution.normalized || primaryEdu.institution.raw}
                              </span>
                            </div>
                          )}

                          {/* Review Queue Placeholder Container */}
                          <div className="my-2 p-4 rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low/50 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                              <Inbox className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-on-surface truncate">
                                Profile Staged for Review Queue
                              </p>
                              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                Demonstrated competencies, evidence spans, and criteria breakdown are ready to watch in the Review Queue.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Footer Strip */}
                        <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                          <span className="text-[11px] font-mono">
                            {isActive ? "Active candidate (Swipe or use arrows)" : "Click to bring forward"}
                          </span>
                          <span className="text-[11px] font-mono text-primary font-semibold">
                            Target: {currentJob?.title}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Action Strip */}
        <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between gap-3 text-xs">
          <span className="text-on-surface-variant font-mono text-[11px]">
            {candidateReviewItems.length} candidate(s) ready in queue
          </span>
          <div className="flex items-center gap-2">
            <Link href="/review">
              <Button
                variant="primary"
                size="sm"
                className="h-8 px-3.5 rounded-xl gap-1.5 text-xs font-semibold"
              >
                <span>Go to Review Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Action-Only Overlay Popup (Identical to production ResumeIngestionModal) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 !m-0 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/40 bg-surface-container-low shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <Typography variant="title-medium" className="text-on-surface font-bold text-sm">
                    Ingest Resumes into Job
                  </Typography>
                  <p className="text-[11px] text-on-surface-variant">
                    Select an open position and target documents to parse and evaluate candidate profiles
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 p-0 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
                title="Close modal (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body: Action Configuration */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 bg-surface-container-lowest">
              {/* Step 1: Select Target Job (Flat list with no lateral borders or rounded edges) */}
              <div className="space-y-2">
                <div className="px-6 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <span>1. Select Target Job</span>
                  </label>
                </div>

                <div className="border-y border-outline-variant/40 divide-y divide-outline-variant/30 bg-surface max-h-48 overflow-y-auto">
                  {SAMPLE_JOBS.map((job) => {
                    const isSelected = job.id === selectedJobId;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`px-6 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/5"
                            : "hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-on-primary"
                                : "border-outline-variant bg-surface"
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-on-primary" />}
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`text-xs font-bold truncate block transition-colors ${
                                isSelected ? "text-primary" : "text-on-surface"
                              }`}
                            >
                              {job.title}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              {job.department} • {job.location}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={isSelected ? "primary" : "neutral"}
                            className="text-[10px] py-0 px-2 font-mono uppercase"
                          >
                            {"mode" in job.work_mode && typeof job.work_mode.mode === "string"
                              ? job.work_mode.mode
                              : (job.employmentType || "Full-time")}
                          </Badge>
                          <span className="text-[10px] text-on-surface-variant font-mono hidden sm:inline">
                            ID: {job.id}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Documents (Flat list with no lateral borders or rounded edges) */}
              <div className="space-y-2">
                <div className="px-6 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>2. Select Documents ({selectedFiles.length}/{mockFiles.length})</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([...mockFiles])}
                      className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-on-surface-variant text-[11px]">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-[11px] text-on-surface-variant hover:text-on-surface cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="border-y border-outline-variant/40 divide-y divide-outline-variant/30 bg-surface max-h-56 overflow-y-auto">
                  {mockFiles.map((file) => {
                    const isSelected = selectedFiles.includes(file);
                    return (
                      <div
                        key={file}
                        onClick={() =>
                          setSelectedFiles((prev) =>
                            prev.includes(file)
                              ? prev.filter((f) => f !== file)
                              : [...prev, file]
                          )
                        }
                        className={`px-6 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/5" : "hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-primary border-primary text-on-primary"
                                : "border-outline-variant bg-surface"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span className="text-xs font-semibold text-on-surface truncate">
                            {file}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls (Same Proceed Button, NO show deck view) */}
            <div className="px-6 py-4 border-t border-outline-variant/40 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <Typography variant="body-small">
                {selectedFiles.length > 0
                  ? `Ready to ingest ${selectedFiles.length} document(s) into ${currentJob?.title || "selected role"}`
                  : "Select at least 1 document to proceed"}
              </Typography>

              <Button
                variant="primary"
                size="sm"
                onClick={handleModalProceed}
                disabled={selectedFiles.length === 0 || !selectedJobId}
                className="h-8 px-4 rounded-xl text-xs font-semibold gap-1.5 shadow-xs self-end sm:self-center"
              >
                <span>Proceed ({selectedFiles.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
