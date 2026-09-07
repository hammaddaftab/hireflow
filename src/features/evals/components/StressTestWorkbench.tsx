"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_EXPERIENCE_FIXTURES } from "../data/defaultFixtures";
import type {
  ExperienceTestFixture,
  ExperienceEvalResult,
  BatchEvalSummary,
} from "../types";
import { StressTestSummaryBanner } from "./StressTestSummaryBanner";
import { FixtureList } from "./FixtureList";
import { ComparisonHero } from "./ComparisonHero";
import { DiscrepancyDiagnostics } from "./DiscrepancyDiagnostics";
import { OccupanciesTable } from "./OccupanciesTable";
import { RawJsonViewer } from "./RawJsonViewer";
import { FixtureEditorModal } from "./FixtureEditorModal";

const STORAGE_KEY_CUSTOM_FIXTURES = "hireflow_eval_custom_fixtures";
const STORAGE_KEY_EVAL_RESULTS = "hireflow_eval_results";

export function StressTestWorkbench() {
  const [fixtures, setFixtures] = useState<ExperienceTestFixture[]>(DEFAULT_EXPERIENCE_FIXTURES);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(
    DEFAULT_EXPERIENCE_FIXTURES[0].id
  );
  const [resultsMap, setResultsMap] = useState<Record<string, ExperienceEvalResult>>({});
  const [runningFixtureId, setRunningFixtureId] = useState<string | null>(null);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [batchSummary, setBatchSummary] = useState<BatchEvalSummary | null>(null);

  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [fixtureToEdit, setFixtureToEdit] = useState<ExperienceTestFixture | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load custom fixtures from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FIXTURES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFixtures([...DEFAULT_EXPERIENCE_FIXTURES, ...parsed]);
        }
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const selectedFixture =
    fixtures.find((f) => f.id === selectedFixtureId) || fixtures[0];
  const activeResult = selectedFixture ? resultsMap[selectedFixture.id] : null;

  // Run single fixture stress test
  const handleRunSingle = async (fixtureToRun: ExperienceTestFixture) => {
    setRunningFixtureId(fixtureToRun.id);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/evals/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixture: fixtureToRun }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to execute extraction");
      }

      const evalResult: ExperienceEvalResult = data.data;
      setResultsMap((prev) => ({
        ...prev,
        [fixtureToRun.id]: evalResult,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Stress test failed: ${msg}`);
    } finally {
      setRunningFixtureId(null);
    }
  };

  // Run all fixtures in batch
  const handleRunBatch = async () => {
    setIsRunningBatch(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/evals/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runAll: true, fixtures }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to run batch evaluation");
      }

      const summary: BatchEvalSummary = data.data;
      setBatchSummary(summary);

      // Populate resultsMap with all items
      const newMap: Record<string, ExperienceEvalResult> = {};
      for (const r of summary.results) {
        newMap[r.fixtureId] = r;
      }
      setResultsMap((prev) => ({ ...prev, ...newMap }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Batch suite failed: ${msg}`);
    } finally {
      setIsRunningBatch(false);
    }
  };

  // Save new or edited fixture
  const handleSaveFixture = (savedFixture: ExperienceTestFixture) => {
    let updated: ExperienceTestFixture[];
    const exists = fixtures.some((f) => f.id === savedFixture.id);

    if (exists) {
      updated = fixtures.map((f) => (f.id === savedFixture.id ? savedFixture : f));
    } else {
      updated = [...fixtures, savedFixture];
    }

    setFixtures(updated);
    setSelectedFixtureId(savedFixture.id);

    // Save custom fixtures in localStorage
    const customList = updated.filter((f) => f.isCustom);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_FIXTURES, JSON.stringify(customList));
    } catch {
      // Ignore
    }
  };

  // Delete custom fixture
  const handleDeleteFixture = (fixtureId: string) => {
    const updated = fixtures.filter((f) => f.id !== fixtureId);
    setFixtures(updated);

    if (selectedFixtureId === fixtureId) {
      setSelectedFixtureId(updated[0]?.id || "");
    }

    const customList = updated.filter((f) => f.isCustom);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_FIXTURES, JSON.stringify(customList));
    } catch {
      // Ignore
    }
  };

  // Duplicate fixture
  const handleDuplicateFixture = (fixture: ExperienceTestFixture) => {
    const duplicated: ExperienceTestFixture = {
      ...fixture,
      id: `fixture-custom-${Date.now()}`,
      title: `${fixture.title} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    handleSaveFixture(duplicated);
  };

  // Reset fixtures to default
  const handleResetDefaults = () => {
    if (confirm("Reset fixtures to default preloaded testbed? Custom fixtures will be cleared.")) {
      setFixtures(DEFAULT_EXPERIENCE_FIXTURES);
      setSelectedFixtureId(DEFAULT_EXPERIENCE_FIXTURES[0].id);
      setResultsMap({});
      setBatchSummary(null);
      try {
        localStorage.removeItem(STORAGE_KEY_CUSTOM_FIXTURES);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Suite Controls */}
      <StressTestSummaryBanner
        summary={batchSummary}
        totalFixturesCount={fixtures.length}
        isRunningBatch={isRunningBatch}
        onRunBatch={handleRunBatch}
        onOpenCreateModal={() => {
          setFixtureToEdit(null);
          setEditorModalOpen(true);
        }}
        onResetDefaults={handleResetDefaults}
      />

      {/* Error Callout */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setErrorMsg(null)}
            className="h-6 px-2 text-xs"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Two-Column Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fixtures List (4 cols) */}
        <div className="lg:col-span-4 h-[750px] sticky top-4">
          <FixtureList
            fixtures={fixtures}
            selectedFixtureId={selectedFixtureId}
            onSelectFixture={(f) => setSelectedFixtureId(f.id)}
            onRunSingle={handleRunSingle}
            onEditFixture={(f) => {
              setFixtureToEdit(f);
              setEditorModalOpen(true);
            }}
            onDeleteFixture={handleDeleteFixture}
            onDuplicateFixture={handleDuplicateFixture}
            resultsMap={resultsMap}
            runningFixtureId={runningFixtureId}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Right Column: Active Fixture Workbench & Results (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedFixture && (
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
              {/* Fixture Header & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-on-surface">
                      {selectedFixture.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant font-semibold">
                      {selectedFixture.category.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {selectedFixture.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={runningFixtureId === selectedFixture.id}
                    onClick={() => handleRunSingle(selectedFixture)}
                    className="h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs"
                  >
                    <Play
                      className={`h-3.5 w-3.5 ${
                        runningFixtureId === selectedFixture.id ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {runningFixtureId === selectedFixture.id
                        ? "Extracting with OpenAI..."
                        : "Run Stress Test"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Collapsible Manual Resume Text Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                  <span>Manual Input Resume Text:</span>
                  <span className="font-mono text-[11px] font-normal">
                    Exp: {selectedFixture.expected.totalYears} yrs · Min Job:{" "}
                    {selectedFixture.targetJobRequirement.minYears} yrs
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-mono text-on-surface-variant max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {selectedFixture.resumeText}
                </div>
              </div>

              {/* Active Results Section */}
              {activeResult ? (
                <div className="space-y-4 pt-2">
                  {/* Hero Summary Card */}
                  <ComparisonHero result={activeResult} />

                  {/* Discrepancy Diagnostics */}
                  <DiscrepancyDiagnostics diagnostics={activeResult.diagnostics} />

                  {/* Occupancies Breakdown Table */}
                  <OccupanciesTable entries={activeResult.entries} />

                  {/* Raw JSON Inspector */}
                  <RawJsonViewer
                    data={activeResult.rawExtraction}
                    title="OpenAI Raw Structured Extraction Output"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/60 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-surface text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Ready to Test
                    </h3>
                    <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                      Click &quot;Run Stress Test&quot; above to invoke the configured OpenAI model, extract candidate work history, and benchmark the calculated experience against the expected ground truth.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={runningFixtureId === selectedFixture.id}
                    onClick={() => handleRunSingle(selectedFixture)}
                    className="h-8 px-4 text-xs gap-1.5 font-semibold"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Run Test Now</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixture Editor Modal */}
      <FixtureEditorModal
        isOpen={editorModalOpen}
        initialFixture={fixtureToEdit}
        onClose={() => {
          setEditorModalOpen(false);
          setFixtureToEdit(null);
        }}
        onSave={handleSaveFixture}
      />
    </div>
  );
}
