"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Cpu,
  BookmarkCheck,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  ExternalLink,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { IdentityParseResult } from "../../services/identityParseService";
import type { SharedEvalInput, EvalRunOutput } from "../../storage/evalStore";
import { SharedInputList } from "../../components/SharedInputList";

interface LocationPreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  resumeText: string;
}

const LOCATION_TEST_PRESETS: LocationPreset[] = [
  {
    id: "preset-isb-territory",
    title: "Preset 1: Islamabad Territory",
    badge: "Federal Territory (ICT)",
    description: "Sector G-13/2 & ISB abbreviation -> Islamabad Capital Territory",
    resumeText: `DR. AYESHA MALIK
Principal AI Scientist
Email: ayesha.malik@example.com | Phone: +92 300 5551234
Location: Street 8, Sector G-13/2, Islamabad (ISB), Pakistan
CNIC: 61101-1234567-1

SUMMARY
AI research leader specializing in natural language processing and computer vision systems.

LINKS
LinkedIn: https://linkedin.com/in/ayesha-malik-ai
GitHub: https://github.com/ayeshamalik-research`,
  },
  {
    id: "preset-provincial-variety",
    title: "Preset 2: Provincial Variety",
    badge: "Punjab & Sindh",
    description: "Bare Lahore residence with Clifton (Karachi) and Rawalpindi projects",
    resumeText: `BILAL AHMED
Senior Cloud Infrastructure Architect
Email: bilal.ahmed@example.com | Phone: 0321-9876543
Location: Lahore, Pakistan
CNIC: 35202-7654321-3

PROFILE
Cloud architect based in Lahore, previously deployed infrastructure in Clifton, Karachi and Satellite Town, Rawalpindi.

LINKS
GitHub: https://github.com/bilalahmed-cloud
Portfolio: https://bilalahmed.dev`,
  },
  {
    id: "preset-unspecified-remote",
    title: "Preset 3: Unspecified / Remote",
    badge: "Unspecified Bucket",
    description: "Fully remote with no city/province -> null normalized location",
    resumeText: `ZAINAB TARIQ
Full Stack Engineer
Email: zainab.t@example.com
Location: Anywhere in Pakistan (Fully Remote / Open to Travel)

EXPERIENCE
Over 5 years building scalable web applications for distributed remote organizations.

LINKS
LinkedIn: https://linkedin.com/in/zainab-tariq-dev`,
  },
];

export function IdentityTestingWorkbench() {
  const [inputs, setInputs] = useState<SharedEvalInput[]>([]);
  const [latestRunsMap, setLatestRunsMap] = useState<Record<string, Record<string, EvalRunOutput>>>({});
  const [selectedInputId, setSelectedInputId] = useState<string>("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInputs, setIsLoadingInputs] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<IdentityParseResult | null>(null);
  const [isSavedOutput, setIsSavedOutput] = useState(false);
  const [savedRunMeta, setSavedRunMeta] = useState<{ createdAt: string; model: string; durationMs: number } | null>(null);
  const [jsonTab, setJsonTab] = useState<"direct" | "sanitized">("direct");
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

          // Check for saved identity run
          const savedIdRun = fetchedRuns[first.id]?.identity;
          if (savedIdRun?.data) {
            setResult(savedIdRun.data as IdentityParseResult);
            setIsSavedOutput(true);
            setSavedRunMeta({
              createdAt: savedIdRun.createdAt,
              model: savedIdRun.model,
              durationMs: savedIdRun.durationMs,
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

  // Load a quick location stress test preset (max 3)
  const handleSelectPreset = (preset: LocationPreset) => {
    setActivePresetId(preset.id);
    setSelectedInputId("");
    setInputText(preset.resumeText);
    setResult(null);
    setIsSavedOutput(false);
    setSavedRunMeta(null);
    setErrorMsg(null);
  };

  // When user selects a named input from the shared collection
  const handleSelectInput = (input: SharedEvalInput) => {
    setActivePresetId(null);
    setSelectedInputId(input.id);
    setInputText(input.resumeText);
    setErrorMsg(null);

    const savedIdRun = latestRunsMap[input.id]?.identity;
    if (savedIdRun?.data) {
      setResult(savedIdRun.data as IdentityParseResult);
      setIsSavedOutput(true);
      setSavedRunMeta({
        createdAt: savedIdRun.createdAt,
        model: savedIdRun.model,
        durationMs: savedIdRun.durationMs,
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

  // Executes identity extraction and normalization pipeline
  const handleParse = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/evals/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: inputText.trim(),
          inputId: selectedInputId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to parse identity");
      }

      const parseResult = data.data as IdentityParseResult;
      setResult(parseResult);
      setIsSavedOutput(false);
      setSavedRunMeta(null);

      // Update latestRunsMap locally
      if (selectedInputId) {
        setLatestRunsMap((prev) => ({
          ...prev,
          [selectedInputId]: {
            ...(prev[selectedInputId] || {}),
            identity: {
              id: `run-${Date.now()}`,
              inputId: selectedInputId,
              aspect: "identity",
              status: parseResult.diagnostics.some((d) => d.level === "error") ? "fail" : "completed",
              durationMs: parseResult.durationMs,
              model: parseResult.model,
              provider: "openai",
              createdAt: new Date().toISOString(),
              summary: parseResult.summary,
              diagnostics: parseResult.diagnostics,
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
        : JSON.stringify(result.sanitizedIdentity, null, 2);

    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedInput = inputs.find((i) => i.id === selectedInputId);
  const activePreset = LOCATION_TEST_PRESETS.find((p) => p.id === activePresetId);

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
            activeAspect="identity"
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
                    {activePreset?.title || selectedInput?.name || "Candidate Identity Workbench"}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant font-semibold">
                    Identity Aspect
                  </span>
                </div>
                {(activePreset?.description || selectedInput?.description) && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {activePreset?.description || selectedInput?.description}
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
                      ? "Extracting Identity..."
                      : isSavedOutput
                      ? "Re-run Extraction"
                      : "Extract Candidate Identity"}
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

            {/* Quick Location Stress Test Presets (At max 3) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
                <span>Location Stress Test Presets (Max 3):</span>
                <span className="text-[11px] font-normal text-on-surface-variant">
                  Click to load preset text
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {LOCATION_TEST_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary text-on-surface shadow-xs"
                          : "bg-surface-container-low border-outline-variant/40 hover:border-outline-variant/80 text-on-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold truncate">{preset.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant font-semibold shrink-0">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-snug line-clamp-2">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

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
                <h3 className="text-sm font-bold text-on-surface">Identity Extraction Trace</h3>
                <p className="text-[11px] text-on-surface-variant">
                  Direct AI extraction vs normalized identity attributes
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
                <p className="text-xs font-medium text-on-surface">Ready to parse identity</p>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Click &quot;Extract Candidate Identity&quot; above to inspect parsed name, email, phone, CNIC, normalized geographic location, and portfolio URLs.
                </p>
              </div>
            )}

            {/* Loading placeholder */}
            {isLoading && (
              <div className="p-12 text-center space-y-2 rounded-xl bg-surface-container-low/40">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs text-on-surface-variant">Calling LLM and parsing identity fields...</p>
              </div>
            )}

            {/* Results display */}
            {result && !isLoading && (
              <div className="space-y-4">
                {/* Diagnostics if present */}
                {result.diagnostics.length > 0 && (
                  <div className="space-y-2">
                    {result.diagnostics.map((d, idx) => {
                      const isError = d.level === "error";
                      const isWarning = d.level === "warning";
                      const style = isError
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200"
                        : isWarning
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
                        : "bg-surface-container-low border-outline-variant/40 text-on-surface";
                      const IconComponent = isError ? AlertCircle : isWarning ? AlertTriangle : Info;

                      return (
                        <div
                          key={`${d.code}-${idx}`}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${style}`}
                        >
                          <IconComponent className="h-4 w-4 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="font-semibold">{d.title}</div>
                            <div className="text-xs leading-relaxed opacity-90">{d.detail}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Grid of structured identity cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Core Contact Attributes */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Candidate Contact &amp; Registry
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-on-surface-variant">Name:</span>
                        <span className="font-bold text-on-surface">
                          {result.sanitizedIdentity.name || "(none detected)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                        <span className="text-on-surface-variant">Email:</span>
                        <span className="font-mono text-[11px] text-on-surface">
                          {result.sanitizedIdentity.email || "(none detected)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                        <span className="text-on-surface-variant">Phone:</span>
                        <span className="font-mono text-[11px] text-on-surface">
                          {result.sanitizedIdentity.phone || "(none detected)"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                        <span className="text-on-surface-variant">CNIC:</span>
                        <span className="font-mono text-[11px] font-semibold text-primary">
                          {result.sanitizedIdentity.cnic || "(none)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Geographic Normalization */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Geographic Normalization
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-on-surface-variant block">
                          Raw Stated Address
                        </span>
                        <div className="font-mono text-[11px] text-on-surface bg-surface p-2 rounded-lg border border-outline-variant/30">
                          {result.sanitizedIdentity.location?.raw || "(none stated)"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-surface border border-outline-variant/30 space-y-0.5">
                          <span className="text-[10px] font-semibold text-on-surface-variant block flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span>Canonical City</span>
                          </span>
                          <span className="font-bold text-xs text-primary">
                            {result.sanitizedIdentity.location?.normalized?.city || "(unresolved)"}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-surface border border-outline-variant/30 space-y-0.5">
                          <span className="text-[10px] font-semibold text-on-surface-variant block">
                            Province / State
                          </span>
                          <span className="font-medium text-xs text-on-surface">
                            {result.sanitizedIdentity.location?.normalized?.province || "(unresolved)"}
                          </span>
                        </div>
                      </div>

                      {/* Territory Status & Queue Filter Target */}
                      <div className="pt-2 border-t border-outline-variant/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-on-surface-variant">
                            Territory Jurisdiction:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              result.summary.isFederalTerritory
                                ? "bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20"
                                : result.summary.province
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {result.summary.territoryLabel ||
                              (result.summary.province ? `${result.summary.province} Province` : "Unspecified")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-on-surface-variant">
                            Queue Filter Bucket:
                          </span>
                          <span className="font-mono text-[11px] font-bold text-on-surface">
                            {result.sanitizedIdentity.location?.normalized?.city
                              ? result.sanitizedIdentity.location.normalized.city
                              : result.sanitizedIdentity.location?.raw
                              ? "Need Attention"
                              : "Unspecified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Portfolio & Web Links */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Detected Links &amp; Profiles ({result.sanitizedIdentity.links.length})
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {result.summary.platformsDetected.map((plat) => (
                        <span
                          key={plat}
                          className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20 font-semibold"
                        >
                          {plat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {result.sanitizedIdentity.links.length === 0 ? (
                    <div className="p-4 text-center text-xs text-on-surface-variant font-mono bg-surface rounded-lg border border-outline-variant/30">
                      No profile links or portfolio URLs found in text.
                    </div>
                  ) : (
                    <div className="divide-y divide-outline-variant/30 bg-surface rounded-xl border border-outline-variant/40 overflow-hidden text-xs">
                      {result.sanitizedIdentity.links.map((link, idx) => (
                        <div
                          key={`${link.address}-${idx}`}
                          className="p-2.5 flex items-center justify-between gap-3 hover:bg-surface-container-low/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant font-semibold shrink-0">
                              {link.platform?.normalized || link.platform?.raw || "link"}
                            </span>
                            <span className="font-mono text-[11px] text-on-surface truncate">
                              {link.address}
                            </span>
                          </div>

                          <a
                            href={link.address.startsWith("http") ? link.address : `https://${link.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer shrink-0"
                            title="Open link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
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
                        onClick={() => setJsonTab("sanitized")}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          jsonTab === "sanitized"
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        Sanitized Identity JSON
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
                      : JSON.stringify(result.sanitizedIdentity, null, 2)}
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
