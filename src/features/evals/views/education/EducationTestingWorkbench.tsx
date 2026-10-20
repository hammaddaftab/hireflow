"use client";

import React, { useState, useEffect } from "react";
import { Play, Copy, Check, AlertCircle, ArrowRight, Clock, Cpu, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { EducationParseResult } from "../../services/educationParseService";
import type { SharedEvalInput, EvalRunOutput } from "../../storage/evalStore";
import { SharedInputList } from "../../components/SharedInputList";

// Testing workbench for Education extraction and normalization with permanent disk persistence
export function EducationTestingWorkbench() {
  const [inputs, setInputs] = useState<SharedEvalInput[]>([]);
  const [latestRunsMap, setLatestRunsMap] = useState<Record<string, Record<string, EvalRunOutput>>>({});
  const [selectedInputId, setSelectedInputId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInputs, setIsLoadingInputs] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<EducationParseResult | null>(null);
  const [isSavedOutput, setIsSavedOutput] = useState(false);
  const [savedRunMeta, setSavedRunMeta] = useState<{ createdAt: string; model: string; durationMs: number } | null>(null);
  const [jsonTab, setJsonTab] = useState<"direct" | "normalized">("direct");
  const [copied, setCopied] = useState(false);

  // Load shared inputs and saved outputs on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoadingInputs(true);
      try {
        const res = await fetch("/api/evals/inputs");
        const json = await res.json();
        if (!mounted || !json.data) return;

        const fetchedInputs = (json.data.inputs || []) as SharedEvalInput[];
        const fetchedRuns = (json.data.latestRuns || {}) as Record<string, Record<string, EvalRunOutput>>;

        setInputs(fetchedInputs);
        setLatestRunsMap(fetchedRuns);

        if (fetchedInputs.length > 0) {
          const first = fetchedInputs[0];
          setSelectedInputId(first.id);
          setInputText(first.resumeText);

          // Check for saved education run
          const savedEduRun = fetchedRuns[first.id]?.education;
          if (savedEduRun?.data) {
            setResult(savedEduRun.data as EducationParseResult);
            setIsSavedOutput(true);
            setSavedRunMeta({
              createdAt: savedEduRun.createdAt,
              model: savedEduRun.model,
              durationMs: savedEduRun.durationMs,
            });
          }
        }
      } catch {
        // Ignore load error
      } finally {
        if (mounted) setIsLoadingInputs(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // When user selects a named input from the shared collection
  const handleSelectInput = (input: SharedEvalInput) => {
    setSelectedInputId(input.id);
    setInputText(input.resumeText);
    setErrorMsg(null);

    const savedEduRun = latestRunsMap[input.id]?.education;
    if (savedEduRun?.data) {
      setResult(savedEduRun.data as EducationParseResult);
      setIsSavedOutput(true);
      setSavedRunMeta({
        createdAt: savedEduRun.createdAt,
        model: savedEduRun.model,
        durationMs: savedEduRun.durationMs,
      });
    } else {
      setResult(null);
      setIsSavedOutput(false);
      setSavedRunMeta(null);
    }
  };

  // Creates and saves a new named input to the permanent collection
  const handleSaveInput = async (newInp: { name: string; resumeText: string; description?: string }) => {
    const res = await fetch("/api/evals/inputs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newInp),
    });
    const data = await res.json();
    if (!res.ok || !data.data) {
      throw new Error(data.error?.message || "Failed to save input");
    }
    const saved = data.data as SharedEvalInput;
    setInputs((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);
    handleSelectInput(saved);
  };

  // Deletes an input from disk
  const handleDeleteInput = async (id: string) => {
    await fetch(`/api/evals/inputs?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setInputs((prev) => prev.filter((i) => i.id !== id));
    if (selectedInputId === id) {
      const remaining = inputs.filter((i) => i.id !== id);
      if (remaining[0]) {
        handleSelectInput(remaining[0]);
      } else {
        setSelectedInputId("");
        setInputText("");
        setResult(null);
      }
    }
  };

  // Executes extraction and normalization pipeline, saving output permanently
  const handleParse = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/evals/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: inputText.trim(),
          inputId: selectedInputId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to parse education");
      }

      const parseResult = data.data as EducationParseResult;
      setResult(parseResult);
      setIsSavedOutput(false);
      setSavedRunMeta(null);

      // Update latestRunsMap locally
      if (selectedInputId) {
        setLatestRunsMap((prev) => ({
          ...prev,
          [selectedInputId]: {
            ...(prev[selectedInputId] || {}),
            education: {
              id: `run-${Date.now()}`,
              inputId: selectedInputId,
              aspect: "education",
              status: "completed",
              durationMs: parseResult.durationMs,
              model: parseResult.model,
              provider: "openai",
              createdAt: new Date().toISOString(),
              summary: {
                rawEntriesCount: parseResult.rawEntriesCount,
                normalizedEntriesCount: parseResult.normalizedEntriesCount,
                highestDegreeTier: parseResult.highestDegreeTier,
              },
              data: parseResult,
            },
          },
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Parsing failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Copies JSON payload to clipboard
  const handleCopyJson = () => {
    if (!result) return;
    const jsonStr =
      jsonTab === "direct"
        ? JSON.stringify(result.directAiExtraction, null, 2)
        : JSON.stringify(result.normalizedExtraction, null, 2);

    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedInput = inputs.find((i) => i.id === selectedInputId);

  return (
    <div className="space-y-4">
      {/* Error Callout */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
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

      {/* Main 2-column split workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Shared named input collection (4 cols) */}
        <div className="lg:col-span-4 h-[750px] sticky top-4">
          <SharedInputList
            inputs={inputs}
            selectedInputId={selectedInputId}
            onSelectInput={handleSelectInput}
            onSaveInput={handleSaveInput}
            onDeleteInput={handleDeleteInput}
            latestRunsMap={latestRunsMap}
            activeAspect="education"
            isLoading={isLoadingInputs}
          />
        </div>

        {/* Right Column: Active Input Workbench & Inspection Results (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Input Details & Trigger Card */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-on-surface">
                    {selectedInput?.name || "Candidate Education Workbench"}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant font-semibold">
                    Education Aspect
                  </span>
                </div>
                {selectedInput?.description && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {selectedInput.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isLoading || !inputText.trim()}
                  onClick={handleParse}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Play className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>
                    {isLoading
                      ? "Extracting & Normalizing..."
                      : isSavedOutput
                      ? "Re-run Extraction"
                      : "Extract & Normalize Education"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Permanent Saved Output Banner if loaded from disk */}
            {isSavedOutput && savedRunMeta && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Displaying permanently saved run output from disk (Model: {savedRunMeta.model}, Latency: {(savedRunMeta.durationMs / 1000).toFixed(2)}s).
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleParse}
                  className="h-6 px-2 text-[11px] font-semibold bg-surface shrink-0"
                >
                  Re-run
                </Button>
              </div>
            )}

            {/* Input Resume Text preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                <span>Input Resume Text:</span>
                <span className="font-mono text-[11px] font-normal">
                  {inputText.length} characters
                </span>
              </div>
              <textarea
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Candidate resume text..."
                className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Inspection Results Section */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Extraction & Normalization Trace</h3>
                <p className="text-[11px] text-on-surface-variant">
                  Direct AI extraction vs post-processing pipeline resolution
                </p>
              </div>

              {result && (
                <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{(result.durationMs / 1000).toFixed(2)}s</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <Cpu className="h-3 w-3" />
                    <span>{result.model}</span>
                  </div>
                </div>
              )}
            </div>

            {/* If no result yet */}
            {!result && !isLoading && (
              <div className="p-12 text-center space-y-2 border border-dashed border-outline-variant/50 rounded-xl bg-surface-container-low/40">
                <p className="text-xs font-medium text-on-surface">Ready to parse</p>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Click &quot;Extract &amp; Normalize Education&quot; above to inspect the direct AI output alongside university and field normalization. Results are automatically saved permanently to disk.
                </p>
              </div>
            )}

            {/* Loading placeholder */}
            {isLoading && (
              <div className="p-12 text-center space-y-2 rounded-xl bg-surface-container-low/40">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs text-on-surface-variant">Calling LLM and running normalization catalog...</p>
              </div>
            )}

            {/* Results display */}
            {result && !isLoading && (
              <div className="space-y-4">
                {/* Summary count */}
                <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30">
                  <span>
                    Extracted <strong className="text-on-surface">{result.comparisons.length}</strong> education entry/entries
                  </span>
                  <span>
                    {result.comparisons.filter((c) => c.canonicalInstitution).length}/{result.comparisons.length} Universities Normalized
                  </span>
                </div>

                {/* Entries list */}
                <div className="space-y-3">
                  {result.comparisons.map((c) => {
                    const isExact = c.institutionMatchMethod === "EXACT_ALIAS";
                    const isFuzzy = c.institutionMatchMethod === "TOKEN_SORT_FUZZY";
                    const badgeClass = isExact
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                      : isFuzzy
                      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";

                    return (
                      <div
                        key={c.index}
                        className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3 text-xs"
                      >
                        {/* Entry Header */}
                        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                          <span className="font-bold text-on-surface">Entry #{c.index}</span>
                          <div className="flex items-center gap-2">
                            {c.isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                Currently Enrolled
                              </span>
                            )}
                            {c.grade && (
                              <span className="text-[11px] font-mono text-on-surface-variant">
                                Grade: {c.grade}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* University Normalization Row */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            <span>University / Institution Title</span>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${badgeClass}`}>
                              {c.institutionMatchMethod}
                              {c.institutionConfidence > 0 ? ` (${Math.round(c.institutionConfidence * 100)}%)` : ""}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {/* Left: Raw AI extracted */}
                            <div className="p-2 rounded-lg bg-surface border border-outline-variant/30 space-y-0.5">
                              <span className="text-[10px] font-semibold text-on-surface-variant block">
                                Direct AI Parsed (Raw)
                              </span>
                              <div className="font-mono text-[11px] text-on-surface break-words">
                                {c.rawInstitution || "(empty)"}
                              </div>
                            </div>

                            {/* Right: Pipeline Normalized */}
                            <div className="p-2 rounded-lg bg-surface border border-outline-variant/30 space-y-0.5">
                              <span className="text-[10px] font-semibold text-primary block flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                <span>Pipeline Normalized</span>
                              </span>
                              <div className="font-medium text-[11px] text-on-surface break-words">
                                {c.canonicalInstitution || (
                                  <span className="text-rose-600 dark:text-rose-400 font-mono">Unresolved</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Degree Level & Major Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/20">
                          {/* Degree Level */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                              Degree Level
                            </span>
                            <div className="p-2 rounded-lg bg-surface border border-outline-variant/30 space-y-0.5">
                              <div className="text-[11px] text-on-surface-variant">
                                Raw: <span className="font-mono text-on-surface">{c.rawDegree || "(none)"}</span>
                              </div>
                              <div className="text-[11px] text-on-surface">
                                Tier:{" "}
                                <span className="font-bold text-primary">
                                  {c.normalizedDegreeTier || "null (non-degree/bootcamp)"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Field of Study */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                              Field of Study
                            </span>
                            <div className="p-2 rounded-lg bg-surface border border-outline-variant/30 space-y-0.5">
                              <div className="text-[11px] text-on-surface-variant">
                                Raw: <span className="font-mono text-on-surface">{c.rawField || "(none)"}</span>
                              </div>
                              <div className="text-[11px] text-on-surface">
                                Canonical:{" "}
                                <span className="font-semibold text-primary">
                                  {c.canonicalField || "Unresolved"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="text-[11px] font-mono text-on-surface-variant pt-1">
                          Timeline: {c.startDate || "N/A"} to {c.isCurrent ? "Present" : c.endDate || "N/A"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Collapsible Dual-JSON Inspector */}
                <div className="rounded-xl border border-outline-variant/40 bg-surface overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low border-b border-outline-variant/30 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setJsonTab("direct")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          jsonTab === "direct"
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Direct AI JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => setJsonTab("normalized")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          jsonTab === "normalized"
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Post-Normalization JSON
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyJson}
                      className="h-6 px-2 text-[11px] gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="p-3 text-[11px] font-mono text-on-surface-variant bg-surface-container-lowest overflow-x-auto max-h-72 leading-relaxed">
                    {jsonTab === "direct"
                      ? JSON.stringify(result.directAiExtraction, null, 2)
                      : JSON.stringify(result.normalizedExtraction, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
