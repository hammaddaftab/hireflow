"use client";

import React, { useState } from "react";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UniversityResult {
  rawQuery: string;
  strippedCampus: string;
  sortedTokens: string;
  canonicalName: string | null;
  canonicalId: string | null;
  matchMethod: "EXACT_ALIAS" | "TOKEN_SORT_FUZZY" | "UNRESOLVED";
  confidence: number;
  isUnverified: boolean;
}

interface DegreeTierResult {
  rawQuery: string;
  degreeTier: "doctorate" | "masters" | "bachelors" | "diploma" | "high_school" | null;
  tierReason: string;
}

interface FieldResult {
  rawQuery: string;
  canonicalField: string | null;
  isCsEquivalent: boolean;
}

const UNIVERSITY_PRESETS = [
  "FAST-NUCES",
  "FAST CFD",
  "NUST SEECS",
  "PUCIT",
  "LUMS",
  "COMSATS Islamabad",
  "NED UET",
  "Quaid-i-Azam University",
];

const DEGREE_TIER_PRESETS = [
  "PhD / Doctorate",
  "Master of Science (MS)",
  "Bachelor of Science (BS)",
  "Associate Degree in Computer Science (ADP)",
  "DAE 3-Year Diploma",
  "FSc Pre-Engineering",
  "12-Week Intensive Bootcamp Certificate",
];

const FIELD_PRESETS = [
  "Artificial Intelligence",
  "BSCS",
  "Software Engineering",
  "Data Science",
  "Information Technology",
  "Electrical Engineering",
  "Business Administration",
  "Accounting & Finance",
];

// Interactive workbench for testing university, degree tier, and field normalization independently
export function NormalizationLabWorkbench() {
  // University state
  const [uniQuery, setUniQuery] = useState(UNIVERSITY_PRESETS[0]);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniResult, setUniResult] = useState<UniversityResult | null>(null);
  const [uniError, setUniError] = useState<string | null>(null);

  // Degree Tier state
  const [tierQuery, setTierQuery] = useState(DEGREE_TIER_PRESETS[0]);
  const [tierLoading, setTierLoading] = useState(false);
  const [tierResult, setTierResult] = useState<DegreeTierResult | null>(null);
  const [tierError, setTierError] = useState<string | null>(null);

  // Field of Study state
  const [fieldQuery, setFieldQuery] = useState(FIELD_PRESETS[0]);
  const [fieldLoading, setFieldLoading] = useState(false);
  const [fieldResult, setFieldResult] = useState<FieldResult | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Normalizes university title
  const handleNormalizeUniversity = async () => {
    if (!uniQuery.trim()) return;
    setUniLoading(true);
    setUniError(null);

    try {
      const res = await fetch("/api/evals/normalization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "university", query: uniQuery.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to normalize university");
      }

      setUniResult(data.data as UniversityResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUniError(msg);
    } finally {
      setUniLoading(false);
    }
  };

  // Normalizes degree tier level
  const handleNormalizeDegreeTier = async () => {
    if (!tierQuery.trim()) return;
    setTierLoading(true);
    setTierError(null);

    try {
      const res = await fetch("/api/evals/normalization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "degree_level", query: tierQuery.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to normalize degree tier");
      }

      setTierResult(data.data as DegreeTierResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTierError(msg);
    } finally {
      setTierLoading(false);
    }
  };

  // Normalizes field of study & checks CS equivalence
  const handleNormalizeField = async () => {
    if (!fieldQuery.trim()) return;
    setFieldLoading(true);
    setFieldError(null);

    try {
      const res = await fetch("/api/evals/normalization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "field", query: fieldQuery.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to normalize field of study");
      }

      setFieldResult(data.data as FieldResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFieldError(msg);
    } finally {
      setFieldLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
          Normalization Engine Lab
        </h1>
        <p className="text-xs text-on-surface-variant max-w-2xl">
          Test candidate university titles, degree levels, and fields of study independently against the in-memory normalization catalog with zero LLM latency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Module 1: University Normalization (Left Column) */}
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">University Title Normalizer</h2>
                <p className="text-[11px] text-on-surface-variant">
                  Alias catalog &amp; token-sort fuzzy resolution
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUniQuery("");
                setUniResult(null);
              }}
              className="h-7 px-2 text-xs text-on-surface-variant hover:text-on-surface"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              <span>Clear</span>
            </Button>
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Quick Test Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {UNIVERSITY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setUniQuery(preset)}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface-variant transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Input field & Run button */}
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Raw University Title
              </label>
              <input
                type="text"
                value={uniQuery}
                onChange={(e) => setUniQuery(e.target.value)}
                placeholder="e.g. FAST NUCES Chiniot-Faisalabad Campus"
                className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNormalizeUniversity();
                }}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={uniLoading || !uniQuery.trim()}
              onClick={handleNormalizeUniversity}
              className="w-full h-8 text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Play className={`h-3 w-3 ${uniLoading ? "animate-spin" : ""}`} />
              <span>{uniLoading ? "Resolving..." : "Normalize University"}</span>
            </Button>
          </div>

          {/* Error callout */}
          {uniError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
              {uniError}
            </div>
          )}

          {/* University Result Panel */}
          {uniResult && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                <span className="font-bold text-on-surface">Resolution Result</span>
                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${
                    uniResult.matchMethod === "EXACT_ALIAS"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                      : uniResult.matchMethod === "TOKEN_SORT_FUZZY"
                      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                  }`}
                >
                  {uniResult.matchMethod}
                  {uniResult.confidence > 0 ? ` (${Math.round(uniResult.confidence * 100)}%)` : ""}
                </span>
              </div>

              {/* Canonical Name */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                  Canonical Institution Name
                </span>
                <div className="p-2 rounded-lg bg-surface border border-outline-variant/30 text-xs font-semibold text-on-surface">
                  {uniResult.canonicalName ? (
                    <span className="text-primary">{uniResult.canonicalName}</span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400">Unresolved in Catalog</span>
                  )}
                </div>
              </div>

              {/* Preprocessing details */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-surface border border-outline-variant/20 space-y-0.5">
                  <span className="text-[10px] text-on-surface-variant font-medium block">
                    Stripped Campus Clause
                  </span>
                  <span className="font-mono text-on-surface break-words">
                    {uniResult.strippedCampus || "(none)"}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-surface border border-outline-variant/20 space-y-0.5">
                  <span className="text-[10px] text-on-surface-variant font-medium block">
                    Catalog ID
                  </span>
                  <span className="font-mono text-on-surface break-words">
                    {uniResult.canonicalId || "(null)"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Two Distinct Modules for Degree Tier & Field */}
        <div className="space-y-6">
          {/* Module 2: Degree Level Tier Normalizer */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-on-surface">Degree Tier Normalizer</h2>
                  <p className="text-[11px] text-on-surface-variant">
                    Maps degree title to canonical tier enum
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTierQuery("");
                  setTierResult(null);
                }}
                className="h-7 px-2 text-xs text-on-surface-variant hover:text-on-surface"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                <span>Clear</span>
              </Button>
            </div>

            {/* Quick presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Degree Level Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEGREE_TIER_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTierQuery(preset)}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface-variant transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Action */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Raw Degree Level String
                </label>
                <input
                  type="text"
                  value={tierQuery}
                  onChange={(e) => setTierQuery(e.target.value)}
                  placeholder="e.g. PhD, Bachelor of Science, Associate Degree"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNormalizeDegreeTier();
                  }}
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                disabled={tierLoading || !tierQuery.trim()}
                onClick={handleNormalizeDegreeTier}
                className="w-full h-8 text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Play className={`h-3 w-3 ${tierLoading ? "animate-spin" : ""}`} />
                <span>{tierLoading ? "Resolving Tier..." : "Normalize Degree Tier"}</span>
              </Button>
            </div>

            {/* Error callout */}
            {tierError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                {tierError}
              </div>
            )}

            {/* Result display */}
            {tierResult && (
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                  <span className="font-bold text-on-surface">Standardized Tier</span>
                  <span className="px-2.5 py-0.5 rounded border text-[11px] font-mono font-bold bg-primary/10 text-primary border-primary/20 capitalize">
                    {tierResult.degreeTier || "null (non-degree)"}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant leading-relaxed">
                  {tierResult.tierReason}
                </div>
              </div>
            )}
          </div>

          {/* Module 3: Field of Study / Major Normalizer */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-on-surface">Field of Study Normalizer</h2>
                  <p className="text-[11px] text-on-surface-variant">
                    Discipline synonym mapping &amp; CS equivalence cluster
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFieldQuery("");
                  setFieldResult(null);
                }}
                className="h-7 px-2 text-xs text-on-surface-variant hover:text-on-surface"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                <span>Clear</span>
              </Button>
            </div>

            {/* Quick presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Major / Field Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FIELD_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFieldQuery(preset)}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface-variant transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Action */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Raw Major / Field of Study
                </label>
                <input
                  type="text"
                  value={fieldQuery}
                  onChange={(e) => setFieldQuery(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, BSCS, Software Engineering"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNormalizeField();
                  }}
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                disabled={fieldLoading || !fieldQuery.trim()}
                onClick={handleNormalizeField}
                className="w-full h-8 text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Play className={`h-3 w-3 ${fieldLoading ? "animate-spin" : ""}`} />
                <span>{fieldLoading ? "Resolving Field..." : "Normalize Field of Study"}</span>
              </Button>
            </div>

            {/* Error callout */}
            {fieldError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                {fieldError}
              </div>
            )}

            {/* Result display */}
            {fieldResult && (
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                  <span className="font-bold text-on-surface">Canonical Discipline</span>
                  <span className="font-bold text-primary text-xs">
                    {fieldResult.canonicalField || "Unresolved"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant font-medium">
                    CS Equivalence Cluster Match:
                  </span>
                  <div className="flex items-center gap-1 font-semibold">
                    {fieldResult.isCsEquivalent ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300">Satisfies CS Requirement</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-amber-700 dark:text-amber-300">Non-CS Discipline</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
