import "server-only";
import { generateObject } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import type { AiProvider } from "@/lib/ai/types";
import type { Job } from "@/entities/job";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import {
  EmergentAxesPromptSchema,
  EmergentAxesExtractionSchema,
  buildEmergentAxesPrompt,
  type EmergentAxesPrompt,
  type EmergentAxesExtraction,
  type EmergentAxis,
  type SupportingClaimResolved,
} from "@/entities/extraction/matching/emergentAxes";
import {
  serializeCandidateDigestWithStats,
  approxTokens,
} from "../digest/serializeCandidateDigest";
import { buildReviewQueue } from "@/features/review/core/services/reviewQueueService";

// Lightweight job specification accepted when a full database Job row is not used
export interface DiscoveryJobSpec {
  id?: string;
  title: string;
  department?: string | null;
  location?: string | null;
  seniority_level?: string | null;
  description?: string | null;
  skills_required?: Array<string | { skill?: string; active?: boolean; blocking?: boolean }>;
  skills_preferred?: Array<string | { skill?: string; active?: boolean; blocking?: boolean }>;
  min_experience_years?: number | null;
}

export type JobSpecInput = Job | DiscoveryJobSpec;

// Pre-serialized digest entry (e.g. loaded from exp1-output/*.digest.txt or *.digest.budget.txt)
export interface PreSerializedCandidateDigest {
  candidateId: string;
  digestText: string;
  // Optional map from claim_id/signal_id (e.g. 'c1', 's1') to verbatim evidence_span
  evidenceSpanByRefId?: Record<string, string>;
  profile?: ParsedCandidateProfile;
}

export interface Stage0KnockedOutCandidate {
  candidateId: string;
  candidateName: string;
  contradictions: Array<{
    id: string;
    label: string;
    reasoning: string;
  }>;
}

export interface Stage0GatekeeperResult {
  viableCandidates: ParsedCandidateProfile[];
  knockedOutCandidates: Stage0KnockedOutCandidate[];
}

export interface IndexedCandidateDigest {
  candidateId: string;
  digestText: string;
  approxTokens: number;
  lineByRefId: Map<string, string>;
  evidenceSpanByRefId: Map<string, string>;
}

export interface DiscoverEmergentAxesOptions {
  job: JobSpecInput;
  candidates?: ParsedCandidateProfile[];
  preSerializedDigests?: PreSerializedCandidateDigest[];
  skipStage0?: boolean;
  digestTokenBudget?: number;
  referenceDate?: Date;
  provider?: AiProvider;
  model?: string;
  timeoutMs?: number;
}

export interface EmergentAxesDiscoveryResult {
  result: EmergentAxesExtraction;
  stage0: {
    executed: boolean;
    totalInputCandidates: number;
    viableCount: number;
    knockedOutCount: number;
    knockedOutCandidates: Stage0KnockedOutCandidate[];
  };
  poolStats: {
    contenderCount: number;
    jobSpecTokensApprox: number;
    digestsTokensApprox: number;
    promptTokensApprox: number;
    perCandidateTokens: Array<{ candidateId: string; approxTokens: number }>;
  };
  digestsBatchText: string;
  prompt: string;
  warnings: string[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
  latencyMs: number;
}

// Type guard checking whether a JobSpecInput is a full Job entity
function isFullJobRecord(job: JobSpecInput): job is Job {
  return (
    typeof job === "object" &&
    job !== null &&
    "min_experience" in job &&
    "education_min" in job &&
    "compensation_band" in job
  );
}

// Stage 0 Deterministic Gatekeeper: prunes candidates with hard contradicted blocking requirements
export function runStage0Gatekeeper(
  candidates: ParsedCandidateProfile[],
  job: Job
): Stage0GatekeeperResult {
  const queueItems = buildReviewQueue(candidates, job);
  const viableCandidates: ParsedCandidateProfile[] = [];
  const knockedOutCandidates: Stage0KnockedOutCandidate[] = [];

  for (const item of queueItems) {
    if (item.hasContradicted) {
      const contradictions = item.blockingItems
        .filter((b) => b.status === "contradicted")
        .map((b) => ({
          id: b.id,
          label: b.label,
          reasoning: b.reasoning,
        }));

      knockedOutCandidates.push({
        candidateId: item.candidate.id,
        candidateName: item.candidate.identity?.name || item.candidate.id,
        contradictions,
      });
    } else {
      viableCandidates.push(item.candidate);
    }
  }

  return {
    viableCandidates,
    knockedOutCandidates,
  };
}

// Formats a Job or DiscoveryJobSpec into a compact text specification for emergent axis discovery
export function formatJobSpecForDiscovery(job: JobSpecInput): string {
  const lines: string[] = [];

  const titleLineParts = [
    `Role: ${job.title}`,
    job.seniority_level ? `Seniority: ${job.seniority_level}` : null,
    job.department ? `Department: ${job.department}` : null,
    job.location ? `Location: ${job.location}` : null,
  ].filter(Boolean);
  lines.push(titleLineParts.join(" | "));

  if (job.description) {
    lines.push(`Description: ${job.description.trim()}`);
  }

  const requiredSkills: string[] = [];
  for (const item of job.skills_required || []) {
    if (typeof item === "string") {
      requiredSkills.push(item);
    } else if (item && item.active !== false && item.skill) {
      requiredSkills.push(item.skill);
    }
  }

  const preferredSkills: string[] = [];
  for (const item of job.skills_preferred || []) {
    if (typeof item === "string") {
      preferredSkills.push(item);
    } else if (item && item.active !== false && item.skill) {
      preferredSkills.push(item.skill);
    }
  }

  let minExpYears: number | null = null;
  if (isFullJobRecord(job)) {
    if (job.min_experience?.active && job.min_experience.years != null) {
      minExpYears = job.min_experience.years;
    }
  } else if (job.min_experience_years != null) {
    minExpYears = job.min_experience_years;
  }

  const baselineGates: string[] = [];
  if (minExpYears != null) {
    baselineGates.push(`${minExpYears}+ years FT experience`);
  }
  if (requiredSkills.length > 0) {
    baselineGates.push(`Required Skills: ${requiredSkills.join(", ")}`);
  }
  if (isFullJobRecord(job)) {
    if (job.education_min?.active && job.education_min.degree_level) {
      const eduField = job.education_min.field ? ` in ${job.education_min.field}` : "";
      baselineGates.push(`Education: ${job.education_min.degree_level}${eduField}`);
    }
  }

  if (baselineGates.length > 0) {
    lines.push(`Baseline Gatekeeper Requirements (already filtered): ${baselineGates.join(" | ")}`);
  }

  if (preferredSkills.length > 0) {
    lines.push(`Preferred / Bonus Skills: ${preferredSkills.join(", ")}`);
  }

  return lines.join("\n");
}

// Parses a serialized Mechanism E digest into an O(1) pointer map (header, work_1, c1, s1, etc.)
export function indexCandidateDigest(
  digestText: string,
  explicitCandidateId?: string,
  profile?: ParsedCandidateProfile,
  externalEvidenceSpans?: Record<string, string>
): IndexedCandidateDigest {
  const rawLines = digestText
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  let candidateId = explicitCandidateId || profile?.id || "unknown_candidate";
  const lineByRefId = new Map<string, string>();
  const evidenceSpanByRefId = new Map<string, string>();

  for (let idx = 0; idx < rawLines.length; idx++) {
    const line = rawLines[idx];
    const trimmed = line.trim();

    // First line header: [cand_id] ...
    if (idx === 0) {
      const headerMatch = trimmed.match(/^\[([^\]]+)\]/);
      if (headerMatch && !explicitCandidateId) {
        candidateId = headerMatch[1].trim();
      }
      lineByRefId.set("header", trimmed);
      continue;
    }

    // Role header line: work_1: Sr Backend Eng @ ...
    const workMatch = trimmed.match(/^(work_\d+):/);
    if (workMatch) {
      lineByRefId.set(workMatch[1], trimmed);
      continue;
    }

    // Claim or signal line: [c1:action] ... or [s1:action] ...
    const itemMatch = trimmed.match(/^\[([a-zA-Z]+\d+):[^\]]+\]/);
    if (itemMatch) {
      lineByRefId.set(itemMatch[1], trimmed);
    }
  }

  // Populate verbatim evidence spans from profile if provided
  for (const claim of profile?.role_claims?.claims || []) {
    if (claim.claim_id && claim.evidence_span) {
      evidenceSpanByRefId.set(claim.claim_id, claim.evidence_span);
    }
  }
  for (const signal of profile?.notable_signals?.signals || []) {
    if (signal.signal_id && signal.evidence_span) {
      evidenceSpanByRefId.set(signal.signal_id, signal.evidence_span);
    }
  }

  // Populate verbatim evidence spans from external lookup (e.g. .claims.json) if provided
  if (externalEvidenceSpans) {
    for (const [refId, span] of Object.entries(externalEvidenceSpans)) {
      if (span) {
        evidenceSpanByRefId.set(refId, span);
      }
    }
  }

  return {
    candidateId,
    digestText: rawLines.join("\n"),
    approxTokens: approxTokens(rawLines.join("\n")),
    lineByRefId,
    evidenceSpanByRefId,
  };
}

// Normalizes raw LLM citation strings (e.g. "[cand_01]" -> "cand_01", "[c1:action]" -> "c1")
function normalizeCitationIds(
  rawCandidateId: string,
  rawRefId: string
): { candidateId: string; refId: string } {
  let candidateId = rawCandidateId.trim().replace(/^\[|\]$/g, "");
  let refId = rawRefId.trim().replace(/^\[|\]$/g, "");

  // Handle combined format like "cand_01:c1" in either field
  if (candidateId.includes(":") && !refId) {
    const parts = candidateId.split(":");
    candidateId = parts[0].trim();
    refId = parts[1].trim();
  } else if (refId.startsWith(`${candidateId}:`)) {
    refId = refId.slice(candidateId.length + 1).trim();
  }

  // Strip syntactic tier suffix if LLM wrote "c1:action" instead of "c1"
  if (refId.includes(":")) {
    refId = refId.split(":")[0].trim();
  }

  return { candidateId, refId };
}

// Resolves and validates LLM-emitted emergent axes against the indexed candidate digest pool
export function resolveAndVerifyEmergentAxes(
  rawPromptOutput: EmergentAxesPrompt,
  poolMap: Map<string, IndexedCandidateDigest>
): { extraction: EmergentAxesExtraction; warnings: string[] } {
  const warnings: string[] = [];
  const resolvedAxes: EmergentAxis[] = [];

  rawPromptOutput.axes.forEach((rawAxis, idx) => {
    const axisId = `axis_${idx + 1}`;
    const resolvedClaims: SupportingClaimResolved[] = [];
    const seenPairs = new Set<string>();

    for (const cite of rawAxis.supporting_claims || []) {
      const { candidateId, refId } = normalizeCitationIds(cite.candidate_id, cite.ref_id);
      const pairKey = `${candidateId}::${refId}`;
      if (seenPairs.has(pairKey)) continue;

      const candidateDigest = poolMap.get(candidateId);
      if (!candidateDigest) {
        warnings.push(
          `Axis '${rawAxis.label}' cited unknown candidate_id '${cite.candidate_id}'`
        );
        continue;
      }

      let matchedLine = candidateDigest.lineByRefId.get(refId) ?? null;
      let effectiveRefId = refId;

      if (!matchedLine) {
        // Fallback if model cited "header" equivalent like "education" or "tenure"
        if (/^(edu|education|tenure|logistics|summary|profile)$/i.test(refId)) {
          effectiveRefId = "header";
          matchedLine = candidateDigest.lineByRefId.get("header") ?? null;
        }
      }

      if (!matchedLine) {
        warnings.push(
          `Axis '${rawAxis.label}' cited unknown ref_id '${cite.ref_id}' on candidate '${candidateId}'`
        );
        continue;
      }

      seenPairs.add(`${candidateId}::${effectiveRefId}`);
      const evidenceSpan = candidateDigest.evidenceSpanByRefId.get(effectiveRefId) ?? null;

      resolvedClaims.push({
        candidate_id: candidateId,
        ref_id: effectiveRefId,
        digest_line: matchedLine,
        evidence_span: evidenceSpan,
      });
    }

    resolvedAxes.push({
      axis_id: axisId,
      label: rawAxis.label.trim(),
      category: rawAxis.category,
      rationale: rawAxis.rationale.trim(),
      strong_criteria: rawAxis.strong_criteria.trim(),
      moderate_criteria: rawAxis.moderate_criteria.trim(),
      estimated_pool_prevalence: rawAxis.estimated_pool_prevalence.trim(),
      supporting_claims: resolvedClaims,
    });
  });

  return {
    extraction: EmergentAxesExtractionSchema.parse({
      pool_summary: rawPromptOutput.pool_summary.trim(),
      axes: resolvedAxes,
    }),
    warnings,
  };
}

// Main service that runs Stage 0 (if applicable), compiles digests, and discovers pool-relative emergent axes
export async function discoverEmergentAxesWithUsage(
  options: DiscoverEmergentAxesOptions
): Promise<EmergentAxesDiscoveryResult> {
  const warnings: string[] = [];
  const rawCandidates = options.candidates || [];
  const preSerialized = options.preSerializedDigests || [];

  // 1. Run Stage 0 deterministic gatekeeper if candidate profiles and a full Job are provided
  let viableCandidates = rawCandidates;
  let knockedOutCandidates: Stage0KnockedOutCandidate[] = [];
  let stage0Executed = false;

  if (rawCandidates.length > 0 && !options.skipStage0 && isFullJobRecord(options.job)) {
    const stage0Res = runStage0Gatekeeper(rawCandidates, options.job);
    viableCandidates = stage0Res.viableCandidates;
    knockedOutCandidates = stage0Res.knockedOutCandidates;
    stage0Executed = true;
  }

  // 2. Build indexed digest pool from viable candidate profiles and/or pre-serialized digests
  const indexedPool: IndexedCandidateDigest[] = [];
  const poolMap = new Map<string, IndexedCandidateDigest>();

  for (const profile of viableCandidates) {
    const serialized = serializeCandidateDigestWithStats(profile, {
      candidateLabel: profile.id,
      referenceDate: options.referenceDate,
      tokenBudget: options.digestTokenBudget,
    });
    const indexed = indexCandidateDigest(serialized.text, profile.id, profile);
    indexedPool.push(indexed);
    poolMap.set(indexed.candidateId, indexed);
  }

  for (const item of preSerialized) {
    if (poolMap.has(item.candidateId)) continue;
    const indexed = indexCandidateDigest(
      item.digestText,
      item.candidateId,
      item.profile,
      item.evidenceSpanByRefId
    );
    indexedPool.push(indexed);
    poolMap.set(indexed.candidateId, indexed);
  }

  const jobSpecText = formatJobSpecForDiscovery(options.job);
  const digestsBatchText = indexedPool.map((d) => d.digestText).join("\n\n");
  const prompt = buildEmergentAxesPrompt(jobSpecText, digestsBatchText, indexedPool.length);

  const jobSpecTokensApprox = approxTokens(jobSpecText);
  const digestsTokensApprox = approxTokens(digestsBatchText);
  const promptTokensApprox = approxTokens(prompt);
  const perCandidateTokens = indexedPool.map((d) => ({
    candidateId: d.candidateId,
    approxTokens: d.approxTokens,
  }));

  if (indexedPool.length === 0) {
    warnings.push("No viable candidates available in pool for emergent axis discovery.");
    return {
      result: {
        pool_summary: "No viable candidates in pool.",
        axes: [],
      },
      stage0: {
        executed: stage0Executed,
        totalInputCandidates: rawCandidates.length + preSerialized.length,
        viableCount: 0,
        knockedOutCount: knockedOutCandidates.length,
        knockedOutCandidates,
      },
      poolStats: {
        contenderCount: 0,
        jobSpecTokensApprox,
        digestsTokensApprox: 0,
        promptTokensApprox,
        perCandidateTokens: [],
      },
      digestsBatchText: "",
      prompt,
      warnings,
      latencyMs: 0,
    };
  }

  const abortSignal =
    options.timeoutMs && options.timeoutMs > 0
      ? AbortSignal.timeout(options.timeoutMs)
      : undefined;

  const effectiveProvider =
    options.provider || (process.env.LLM_PROVIDER as AiProvider | undefined);

  // Explicitly disallow mock/offline mode for emergent axis discovery
  if (effectiveProvider === "mock" || process.env.AI_OFFLINE === "true") {
    throw new Error(
      "Mock or offline mode is not supported for emergent axis discovery. Please configure a valid AI provider (openai or google)."
    );
  }

  const resolvedProvider = effectiveProvider || "openai";
  const hasKeyForProvider =
    resolvedProvider === "google"
      ? Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
      : resolvedProvider === "openai"
      ? Boolean(process.env.OPENAI_API_KEY)
      : true;

  if (!hasKeyForProvider && !options.provider) {
    throw new Error(
      `No API key configured for provider '${resolvedProvider}'. Set ${
        resolvedProvider === "google" ? "GOOGLE_GENERATIVE_AI_API_KEY" : "OPENAI_API_KEY"
      } in environment.`
    );
  }

  const startTime = performance.now();
  try {
    const languageModel = getLanguageModel({
      provider: options.provider,
      model: options.model,
    });

    const { object, usage } = await generateObject({
      model: languageModel,
      schema: EmergentAxesPromptSchema,
      prompt,
      ...(abortSignal ? { abortSignal } : {}),
    });

    const latencyMs = Math.round(performance.now() - startTime);
    const { extraction, warnings: verifyWarnings } = resolveAndVerifyEmergentAxes(
      object,
      poolMap
    );
    warnings.push(...verifyWarnings);

    return {
      result: extraction,
      stage0: {
        executed: stage0Executed,
        totalInputCandidates: rawCandidates.length + preSerialized.length,
        viableCount: indexedPool.length,
        knockedOutCount: knockedOutCandidates.length,
        knockedOutCandidates,
      },
      poolStats: {
        contenderCount: indexedPool.length,
        jobSpecTokensApprox,
        digestsTokensApprox,
        promptTokensApprox,
        perCandidateTokens,
      },
      digestsBatchText,
      prompt,
      warnings,
      usage: usage
        ? {
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          }
        : undefined,
      latencyMs,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[DiscoverEmergentAxes] AI discovery failed (${reason}):`, err);
    throw err instanceof Error ? err : new Error(`AI emergent axis discovery failed: ${reason}`);
  }
}

// Convenience wrapper returning only the resolved EmergentAxesExtraction
export async function discoverEmergentAxes(
  options: DiscoverEmergentAxesOptions
): Promise<EmergentAxesExtraction> {
  const res = await discoverEmergentAxesWithUsage(options);
  return res.result;
}
