import "server-only";
import { generateObject } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import type { AiProvider } from "@/lib/ai/types";
import type { Job } from "@/entities/job";
import type { ParsedCandidateProfile } from "@/entities/candidate";
import type {
  EmergentAxis,
  EmergentAxesExtraction,
  SupportingClaimResolved,
} from "@/entities/extraction/matching/emergentAxes";
import {
  type JobSpecInput,
  type PreSerializedCandidateDigest,
  type IndexedCandidateDigest,
  type Stage0KnockedOutCandidate,
  formatJobSpecForDiscovery,
  runStage0Gatekeeper,
  indexCandidateDigest,
  discoverEmergentAxesWithUsage,
} from "./discoverEmergentAxes";
import {
  serializeCandidateDigestWithStats,
  approxTokens,
} from "../digest/serializeCandidateDigest";
import {
  GroupHalvingPromptSchema,
  buildGroupHalvingPrompt,
  FinalistPermutationPromptSchema,
  buildFinalistPermutationPrompt,
  PairwiseComparisonPromptSchema,
  buildPairwiseComparisonPrompt,
  TopCandidatesRankingResultSchema,
  type TopCandidatesRankingResult,
  type TopCandidateEntry,
  type CandidatePairwiseView,
  type HalvingRoundTelemetry,
  type HalvingGroupTelemetry,
  type HalvingGroupCandidateTelemetry,
  type LatinSquareOrderingTelemetry,
  type PairwiseMatchupTelemetry,
} from "@/entities/extraction/matching/topCandidatesRanking";

// Options configuring the Mechanism E Top-3 Ranking Pipeline
export interface RankTopCandidatesOptions {
  job: JobSpecInput;
  candidates?: ParsedCandidateProfile[];
  preSerializedDigests?: PreSerializedCandidateDigest[];
  rawTextByCandidateId?: Record<string, string>;
  emergentAxesResult?: EmergentAxesExtraction;
  skipStage0?: boolean;
  digestTokenBudget?: number;
  referenceDate?: Date;
  seed?: number;
  provider?: AiProvider;
  model?: string;
  timeoutMs?: number;
  concurrencyLimit?: number;
}

// Telemetry and usage stats returned alongside the ranking outcome
export interface RankTopCandidatesResult {
  ranking: TopCandidatesRankingResult;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  totalLatencyMs: number;
  warnings: string[];
}

// Deterministic Mulberry32 seeded pseudo-random number generator
export function createPrng(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic Fisher-Yates shuffle using a supplied seeded PRNG
export function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// Partitions candidate items into balanced groups of 4 to 8 candidates
export function partitionIntoHalvingGroups<T>(items: T[]): T[][] {
  const n = items.length;
  if (n <= 8) return [items];

  const numGroups = Math.ceil(n / 8);
  const baseSize = Math.floor(n / numGroups);
  const remainder = n % numGroups;

  const groups: T[][] = [];
  let currentIndex = 0;

  for (let g = 0; g < numGroups; g++) {
    const groupSize = baseSize + (g < remainder ? 1 : 0);
    groups.push(items.slice(currentIndex, currentIndex + groupSize));
    currentIndex += groupSize;
  }

  return groups;
}

// Generates 4 balanced permutations using cyclic shifts across early, mid, and late thirds
export function generateBalancedPermutations<T>(items: T[]): T[][] {
  const n = items.length;
  if (n <= 1) return [items];
  if (n === 2) return [items, [items[1], items[0]]];
  if (n === 3) {
    return [
      [items[0], items[1], items[2]],
      [items[1], items[2], items[0]],
      [items[2], items[0], items[1]],
      [items[0], items[2], items[1]],
    ];
  }

  const shifts = [0, Math.round(n / 4), Math.round((2 * n) / 4), Math.round((3 * n) / 4)];
  return shifts.map((shift) => {
    const s = shift % n;
    return [...items.slice(s), ...items.slice(0, s)];
  });
}

// Formats candidate profile into complete full-CV text if raw resume text is not provided
export function formatCandidateFullCvText(
  candidateId: string,
  profile?: ParsedCandidateProfile,
  explicitRawText?: string
): string {
  if (explicitRawText && explicitRawText.trim().length > 0) {
    return explicitRawText.trim();
  }

  if (!profile) {
    return `[Candidate ${candidateId} - Raw CV text not provided]`;
  }

  const sections: string[] = [];

  const name = profile.identity?.name || candidateId;
  const location = profile.identity?.location?.raw || profile.identity?.location?.normalized?.city || "";
  const headerParts = [name, location].filter(Boolean);
  sections.push(`Candidate Overview: ${headerParts.join(" | ")}`);

  if (profile.work_history?.entries && profile.work_history.entries.length > 0) {
    const workLines: string[] = ["Work History:"];
    for (const entry of profile.work_history.entries) {
      const dates = `${entry.start_date || "Unknown"} to ${entry.is_current ? "Present" : entry.end_date || "Unknown"}`;
      const empType = entry.employment_type?.value ? ` [${entry.employment_type.value}]` : "";
      workLines.push(`- ${entry.title || "Role"} at ${entry.employer || "Employer"} (${dates})${empType}`);
      if (entry.raw_description) {
        workLines.push(`  Description: ${entry.raw_description.trim()}`);
      }
    }
    sections.push(workLines.join("\n"));
  }

  if (profile.education?.entries && profile.education.entries.length > 0) {
    const eduLines: string[] = ["Education:"];
    for (const edu of profile.education.entries) {
      const inst = edu.institution?.raw || edu.institution?.normalized || "University";
      const deg = edu.degree_level?.raw || edu.degree_level?.normalized || "Degree";
      const field = edu.field?.raw || edu.field?.normalized ? ` in ${edu.field.raw || edu.field.normalized}` : "";
      const grade = edu.grade ? ` (${edu.grade})` : "";
      eduLines.push(`- ${deg}${field} from ${inst}${grade}`);
    }
    sections.push(eduLines.join("\n"));
  }

  if (profile.role_claims?.claims && profile.role_claims.claims.length > 0) {
    const claimLines: string[] = ["Extracted Evidence Spans:"];
    for (const c of profile.role_claims.claims) {
      const tierTag = c.claim_tier || "action_attributed";
      claimLines.push(`- [${c.claim_id}:${tierTag}] ${c.compact_action}${c.outcome_attached ? ` (${c.outcome_attached})` : ""}`);
      if (c.evidence_span) {
        claimLines.push(`  Verbatim: "${c.evidence_span.trim()}"`);
      }
    }
    sections.push(claimLines.join("\n"));
  }

  if (profile.notable_signals?.signals && profile.notable_signals.signals.length > 0) {
    const sigLines: string[] = ["Notable Achievements & Non-Work Spikes:"];
    for (const s of profile.notable_signals.signals) {
      sigLines.push(`- [${s.signal_id}] ${s.context_label}: ${s.compact_action}${s.outcome_attached ? ` (${s.outcome_attached})` : ""}`);
      if (s.evidence_span) {
        sigLines.push(`  Verbatim: "${s.evidence_span.trim()}"`);
      }
    }
    sections.push(sigLines.join("\n"));
  }

  return sections.join("\n\n");
}

// Concurrently maps an array of items with a fixed concurrency limit
async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIdx = 0;

  async function worker() {
    while (nextIdx < items.length) {
      const idx = nextIdx++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// Normalizes raw LLM candidate ID strings (e.g. "[cand_01]" -> "cand_01")
function cleanCandidateId(raw: string): string {
  return raw.trim().replace(/^\[|\]$/g, "");
}

// Normalizes LLM citation strings (e.g. "[c1:action]" -> "c1", "cand_01:s2:action" -> "s2")
function cleanRefId(raw: string, candidateId?: string): string {
  let ref = raw.trim().replace(/^\[|\]$/g, "");
  if (candidateId && ref.startsWith(`${candidateId}:`)) {
    ref = ref.slice(candidateId.length + 1).trim();
  }
  if (ref.includes(":")) {
    const parts = ref
      .split(":")
      .map((p) => p.trim())
      .filter((p) => p && !/^(action|peripheral|action_attributed|peripheral_action|unanchored_claim)$/i.test(p));
    const refMatch = parts.find((p) => /^(c\d+|s\d+|work_\d+|header|L\d+)$/i.test(p));
    ref = refMatch || parts[parts.length - 1] || ref;
  }
  return ref;
}

// Resolves and hydrates supporting citations in O(1) against the indexed digest pool
function hydrateSupportingClaims(
  candidateId: string,
  rawRefIds: string[],
  poolMap: Map<string, IndexedCandidateDigest>
): SupportingClaimResolved[] {
  const candidateDigest = poolMap.get(candidateId);
  if (!candidateDigest) return [];

  const seenRefs = new Set<string>();
  const resolved: SupportingClaimResolved[] = [];

  for (const raw of rawRefIds) {
    const ref = cleanRefId(raw, candidateId);
    if (!ref || seenRefs.has(ref)) continue;
    seenRefs.add(ref);

    let matchedLine = candidateDigest.lineByRefId.get(ref) ?? null;
    let effectiveRef = ref;

    if (!matchedLine && /^(edu|education|tenure|logistics|summary|profile)$/i.test(ref)) {
      effectiveRef = "header";
      matchedLine = candidateDigest.lineByRefId.get("header") ?? null;
    }

    const evidenceSpan = candidateDigest.evidenceSpanByRefId.get(effectiveRef) ?? null;

    resolved.push({
      candidate_id: candidateId,
      ref_id: effectiveRef,
      digest_line: matchedLine,
      evidence_span: evidenceSpan,
    });
  }

  // Fallback to top indexed items if no valid citations were generated
  if (resolved.length === 0) {
    let count = 0;
    for (const [refId, line] of candidateDigest.lineByRefId.entries()) {
      if (count >= 3) break;
      resolved.push({
        candidate_id: candidateId,
        ref_id: refId,
        digest_line: line,
        evidence_span: candidateDigest.evidenceSpanByRefId.get(refId) ?? null,
      });
      count++;
    }
  }

  return resolved;
}

// Main execution engine for Mechanism E Top-3 Ranking Tournament
export async function rankTopCandidatesWithUsage(
  options: RankTopCandidatesOptions
): Promise<RankTopCandidatesResult> {
  const warnings: string[] = [];
  const startTime = performance.now();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const rawCandidates = options.candidates || [];
  const preSerialized = options.preSerializedDigests || [];
  const rawTextMap = new Map<string, string>();
  if (options.rawTextByCandidateId) {
    for (const [k, v] of Object.entries(options.rawTextByCandidateId)) {
      rawTextMap.set(k, v);
    }
  }

  // Verify AI provider configuration
  const effectiveProvider =
    options.provider || (process.env.LLM_PROVIDER as AiProvider | undefined);

  if (effectiveProvider === "mock" || process.env.AI_OFFLINE === "true") {
    throw new Error(
      "Mock or offline mode is not supported for top candidate ranking. Please configure a valid AI provider (openai or google)."
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

  const languageModel = getLanguageModel({
    provider: options.provider,
    model: options.model,
  });

  const abortSignal =
    options.timeoutMs && options.timeoutMs > 0
      ? AbortSignal.timeout(options.timeoutMs)
      : undefined;

  // 1. Stage 0 & Stage 1: Obtain Emergent Axes and Viable Candidate Digest Pool
  let emergentAxes: EmergentAxis[] = [];
  let viableCandidates = rawCandidates;
  let knockedOutCandidates: Stage0KnockedOutCandidate[] = [];
  let stage0ViableCount = 0;

  if (options.emergentAxesResult) {
    emergentAxes = options.emergentAxesResult.axes;
    if (rawCandidates.length > 0 && !options.skipStage0 && typeof options.job === "object" && "min_experience" in options.job) {
      const stage0Res = runStage0Gatekeeper(rawCandidates, options.job as Job);
      viableCandidates = stage0Res.viableCandidates;
      knockedOutCandidates = stage0Res.knockedOutCandidates;
    }
  } else {
    const discoveryRes = await discoverEmergentAxesWithUsage({
      job: options.job,
      candidates: rawCandidates,
      preSerializedDigests: preSerialized,
      skipStage0: options.skipStage0,
      digestTokenBudget: options.digestTokenBudget,
      referenceDate: options.referenceDate,
      provider: options.provider,
      model: options.model,
      timeoutMs: options.timeoutMs,
    });
    emergentAxes = discoveryRes.result.axes;
    warnings.push(...discoveryRes.warnings);
    if (discoveryRes.usage?.inputTokens) totalInputTokens += discoveryRes.usage.inputTokens;
    if (discoveryRes.usage?.outputTokens) totalOutputTokens += discoveryRes.usage.outputTokens;
    knockedOutCandidates = discoveryRes.stage0.knockedOutCandidates;
  }

  // 2. Build indexed digest pool and profile map
  const indexedPool: IndexedCandidateDigest[] = [];
  const poolMap = new Map<string, IndexedCandidateDigest>();
  const profileMap = new Map<string, ParsedCandidateProfile>();

  for (const profile of viableCandidates) {
    profileMap.set(profile.id, profile);
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
    if (item.profile) {
      profileMap.set(item.candidateId, item.profile);
    }
    const indexed = indexCandidateDigest(
      item.digestText,
      item.candidateId,
      item.profile,
      item.evidenceSpanByRefId
    );
    indexedPool.push(indexed);
    poolMap.set(indexed.candidateId, indexed);
  }

  stage0ViableCount = indexedPool.length;

  if (stage0ViableCount === 0) {
    const emptyResult: TopCandidatesRankingResult = {
      top3_status: "confident",
      summary: "No viable candidates survived deterministic filtering.",
      top_candidates: [],
      emergent_axes: emergentAxes,
      telemetry: {
        stage0_viable_count: 0,
        stage2_rounds: [],
        stage3_finalist_ids: [],
        stage3_latin_square_orderings: [],
        stage3_top5_candidate_ids: [],
        stage3_pairwise_matchups: [],
      },
    };
    return {
      ranking: emptyResult,
      totalLatencyMs: Math.round(performance.now() - startTime),
      warnings: ["No viable candidates in pool."],
    };
  }

  const jobSpecText = formatJobSpecForDiscovery(options.job);
  const prng = createPrng(options.seed ?? 42);
  const concurrency = options.concurrencyLimit || 6;

  // 3. Stage 2: Reshuffled Halving Rounds (while survivors > 8)
  let currentSurvivorIds = indexedPool.map((d) => d.candidateId);
  const stage2RoundsTelemetry: HalvingRoundTelemetry[] = [];
  let roundNumber = 1;

  while (currentSurvivorIds.length > 8) {
    // Seeded shuffle of survivors before group partition
    const shuffledSurvivorIds = seededShuffle(currentSurvivorIds, prng);
    const groups = partitionIntoHalvingGroups(shuffledSurvivorIds);
    const groupTelemetries: HalvingGroupTelemetry[] = [];
    const nextRoundSurvivors: string[] = [];

    // Evaluate each group in parallel (forward and reversed passes)
    const evaluatedGroups = await mapConcurrent(groups, concurrency, async (groupCandidateIds, groupIdx) => {
      const forwardOrder = [...groupCandidateIds];
      const reverseOrder = [...groupCandidateIds].reverse();

      const forwardDigestsText = forwardOrder
        .map((cid) => poolMap.get(cid)?.digestText || `[${cid}]`)
        .join("\n\n");
      const reverseDigestsText = reverseOrder
        .map((cid) => poolMap.get(cid)?.digestText || `[${cid}]`)
        .join("\n\n");

      const forwardPrompt = buildGroupHalvingPrompt(jobSpecText, emergentAxes, forwardDigestsText, {
        roundNumber,
        groupIndex: groupIdx,
        totalInGroup: forwardOrder.length,
      });

      const reversePrompt = buildGroupHalvingPrompt(jobSpecText, emergentAxes, reverseDigestsText, {
        roundNumber,
        groupIndex: groupIdx,
        totalInGroup: reverseOrder.length,
      });

      // Run forward and reverse LLM calls in parallel
      const [forwardCallRes, reverseCallRes] = await Promise.all([
        generateObject({
          model: languageModel,
          schema: GroupHalvingPromptSchema,
          prompt: forwardPrompt,
          ...(abortSignal ? { abortSignal } : {}),
        }),
        generateObject({
          model: languageModel,
          schema: GroupHalvingPromptSchema,
          prompt: reversePrompt,
          ...(abortSignal ? { abortSignal } : {}),
        }),
      ]);

      if (forwardCallRes.usage) {
        totalInputTokens += forwardCallRes.usage.inputTokens || 0;
        totalOutputTokens += forwardCallRes.usage.outputTokens || 0;
      }
      if (reverseCallRes.usage) {
        totalInputTokens += reverseCallRes.usage.inputTokens || 0;
        totalOutputTokens += reverseCallRes.usage.outputTokens || 0;
      }

      // Map ranks from both runs
      const forwardRankMap = new Map<string, { rank: number; refs: string[]; outside: boolean; rationale: string }>();
      forwardCallRes.object.rankings.forEach((r, idx) => {
        forwardRankMap.set(cleanCandidateId(r.candidate_id), {
          rank: r.rank || idx + 1,
          refs: r.supporting_refs || [],
          outside: Boolean(r.outside_axes_standout),
          rationale: r.rationale || "",
        });
      });

      const reverseRankMap = new Map<string, { rank: number; refs: string[]; outside: boolean; rationale: string }>();
      reverseCallRes.object.rankings.forEach((r, idx) => {
        reverseRankMap.set(cleanCandidateId(r.candidate_id), {
          rank: r.rank || idx + 1,
          refs: r.supporting_refs || [],
          outside: Boolean(r.outside_axes_standout),
          rationale: r.rationale || "",
        });
      });

      const groupEvaluations: HalvingGroupCandidateTelemetry[] = groupCandidateIds.map((cid) => {
        const f = forwardRankMap.get(cid) || { rank: groupCandidateIds.length, refs: [], outside: false, rationale: "" };
        const r = reverseRankMap.get(cid) || { rank: groupCandidateIds.length, refs: [], outside: false, rationale: "" };
        const avgRank = (f.rank + r.rank) / 2;
        const refs = Array.from(new Set([...f.refs, ...r.refs]));
        const outside = f.outside || r.outside;
        const rationale = f.rationale || r.rationale || "Evaluated in Stage 2 halving group.";

        return {
          candidate_id: cid,
          forward_rank: f.rank,
          reverse_rank: r.rank,
          avg_rank: avgRank,
          survived: false,
          outside_axes_standout: outside,
          supporting_refs: refs,
          rationale,
        };
      });

      // Sort by avg_rank ascending; break ties with outside_axes_standout then candidate_id
      groupEvaluations.sort((a, b) => {
        if (a.avg_rank !== b.avg_rank) return a.avg_rank - b.avg_rank;
        if (a.outside_axes_standout !== b.outside_axes_standout) {
          return a.outside_axes_standout ? -1 : 1;
        }
        return a.candidate_id.localeCompare(b.candidate_id);
      });

      // Keep top 4 per group of 7-8, or ceil(group.length / 2) if smaller
      const keepCount =
        groupCandidateIds.length >= 7 ? 4 : Math.min(4, Math.ceil(groupCandidateIds.length / 2));

      const survivors: string[] = [];
      for (let i = 0; i < groupEvaluations.length; i++) {
        if (i < keepCount) {
          groupEvaluations[i].survived = true;
          survivors.push(groupEvaluations[i].candidate_id);
        }
      }

      return {
        group_index: groupIdx,
        candidates: groupCandidateIds,
        evaluations: groupEvaluations,
        survivors,
      };
    });

    for (const eg of evaluatedGroups) {
      groupTelemetries.push(eg);
      nextRoundSurvivors.push(...eg.survivors);
    }

    stage2RoundsTelemetry.push({
      round_number: roundNumber,
      input_candidate_count: currentSurvivorIds.length,
      survivor_count: nextRoundSurvivors.length,
      groups: groupTelemetries,
    });

    // Guard against stagnation
    if (nextRoundSurvivors.length >= currentSurvivorIds.length) {
      currentSurvivorIds = nextRoundSurvivors.slice(0, 8);
      break;
    }

    currentSurvivorIds = nextRoundSurvivors;
    roundNumber++;
  }

  // 4. Stage 3A: Finalist Permutation Ranking (Latin-Square Balanced Shifts)
  const finalistIds = [...currentSurvivorIds];

  const finalistViews: CandidatePairwiseView[] = finalistIds.map((cid) => {
    const prof = profileMap.get(cid);
    return {
      candidateId: cid,
      candidateName: prof?.identity?.name,
      digestText: poolMap.get(cid)?.digestText || `[${cid}]`,
      fullCvText: formatCandidateFullCvText(cid, prof, rawTextMap.get(cid)),
    };
  });

  const finalistViewMap = new Map<string, CandidatePairwiseView>();
  finalistViews.forEach((v) => finalistViewMap.set(v.candidateId, v));

  const balancedPermutations = generateBalancedPermutations(finalistIds);
  const latinSquareTelemetries: LatinSquareOrderingTelemetry[] = [];
  const latinSquareRanksByCandidate = new Map<string, number[]>();
  finalistIds.forEach((id) => latinSquareRanksByCandidate.set(id, []));

  const permutationResults = await mapConcurrent(
    balancedPermutations,
    concurrency,
    async (permOrder, permIdx) => {
      const finalistsBatchText = permOrder
        .map((cid) => {
          const view = finalistViewMap.get(cid);
          return `### Finalist: ${cid}${view?.candidateName ? ` (${view.candidateName})` : ""}
[TIER-TAGGED CLAIMS DIGEST]
${view?.digestText}

[FULL RESUME TEXT]
${view?.fullCvText}`;
        })
        .join("\n\n----------------------------------------\n\n");

      const prompt = buildFinalistPermutationPrompt(jobSpecText, emergentAxes, finalistsBatchText, {
        permutationIndex: permIdx,
        totalPermutations: balancedPermutations.length,
      });

      const res = await generateObject({
        model: languageModel,
        schema: FinalistPermutationPromptSchema,
        prompt,
        ...(abortSignal ? { abortSignal } : {}),
      });

      if (res.usage) {
        totalInputTokens += res.usage.inputTokens || 0;
        totalOutputTokens += res.usage.outputTokens || 0;
      }

      return {
        permIdx,
        permOrder,
        rankings: res.object.rankings,
      };
    }
  );

  for (const pr of permutationResults) {
    const recordedRankings = pr.permOrder.map((cid, fallbackIdx) => {
      const match = pr.rankings.find((r) => cleanCandidateId(r.candidate_id) === cid);
      const assignedRank = match?.rank || fallbackIdx + 1;
      latinSquareRanksByCandidate.get(cid)?.push(assignedRank);

      return {
        candidate_id: cid,
        rank: assignedRank,
        comparative_notes: match?.comparative_notes || "Ranked in balanced permutation.",
        supporting_refs: match?.supporting_refs || [],
      };
    });

    latinSquareTelemetries.push({
      permutation_index: pr.permIdx,
      candidate_order: pr.permOrder,
      rankings: recordedRankings,
    });
  }

  // Calculate average Latin-square rank
  const avgLatinSquareRankMap = new Map<string, number>();
  for (const cid of finalistIds) {
    const ranks = latinSquareRanksByCandidate.get(cid) || [finalistIds.length];
    const avg = ranks.reduce((sum, r) => sum + r, 0) / (ranks.length || 1);
    avgLatinSquareRankMap.set(cid, Math.round(avg * 10) / 10);
  }

  // Select Top 5 finalists by Latin-Square average rank to advance to pairwise verification
  const sortedFinalists = [...finalistIds].sort((a, b) => {
    const avgA = avgLatinSquareRankMap.get(a) ?? 999;
    const avgB = avgLatinSquareRankMap.get(b) ?? 999;
    if (avgA !== avgB) return avgA - avgB;
    return a.localeCompare(b);
  });

  const top5FinalistIds = sortedFinalists.slice(0, Math.min(5, sortedFinalists.length));

  // 5. Stage 3B: Bidirectional Pairwise Verification on Top 5 Finalists
  const pairwiseMatchups: PairwiseMatchupTelemetry[] = [];
  const pairwiseWinsMap = new Map<string, number>();
  const pairwiseTiesMap = new Map<string, number>();
  const pairwiseLossesMap = new Map<string, number>();
  const headToHeadMatrix = new Map<string, "a_wins" | "b_wins" | "tie">();
  const pairwiseNotesMap = new Map<string, string[]>();
  const pairwiseCitationsMap = new Map<string, string[]>();

  top5FinalistIds.forEach((id) => {
    pairwiseWinsMap.set(id, 0);
    pairwiseTiesMap.set(id, 0);
    pairwiseLossesMap.set(id, 0);
    pairwiseNotesMap.set(id, []);
    pairwiseCitationsMap.set(id, []);
  });

  // Generate all unordered pairs {A, B}
  const unorderedPairs: Array<[string, string]> = [];
  for (let i = 0; i < top5FinalistIds.length; i++) {
    for (let j = i + 1; j < top5FinalistIds.length; j++) {
      unorderedPairs.push([top5FinalistIds[i], top5FinalistIds[j]]);
    }
  }

  const evaluatedMatchups = await mapConcurrent(
    unorderedPairs,
    concurrency,
    async ([candA, candB]) => {
      const viewA = finalistViewMap.get(candA)!;
      const viewB = finalistViewMap.get(candB)!;

      const forwardPrompt = buildPairwiseComparisonPrompt(jobSpecText, emergentAxes, viewA, viewB);
      const reversePrompt = buildPairwiseComparisonPrompt(jobSpecText, emergentAxes, viewB, viewA);

      // Execute A-vs-B and B-vs-A in parallel
      const [resAB, resBA] = await Promise.all([
        generateObject({
          model: languageModel,
          schema: PairwiseComparisonPromptSchema,
          prompt: forwardPrompt,
          ...(abortSignal ? { abortSignal } : {}),
        }),
        generateObject({
          model: languageModel,
          schema: PairwiseComparisonPromptSchema,
          prompt: reversePrompt,
          ...(abortSignal ? { abortSignal } : {}),
        }),
      ]);

      if (resAB.usage) {
        totalInputTokens += resAB.usage.inputTokens || 0;
        totalOutputTokens += resAB.usage.outputTokens || 0;
      }
      if (resBA.usage) {
        totalInputTokens += resBA.usage.inputTokens || 0;
        totalOutputTokens += resBA.usage.outputTokens || 0;
      }

      const winAB = cleanCandidateId(resAB.object.winner_id);
      const winBA = cleanCandidateId(resBA.object.winner_id);

      let resolvedOutcome: "a_wins" | "b_wins" | "tie";
      if (winAB === candA && winBA === candA) {
        resolvedOutcome = "a_wins";
      } else if (winAB === candB && winBA === candB) {
        resolvedOutcome = "b_wins";
      } else {
        // Verdict flipped when prompt presentation flipped: positional tie
        resolvedOutcome = "tie";
      }

      const combinedReasons = `${resAB.object.decisive_reasons} ${resBA.object.decisive_reasons}`.trim();
      const combinedClaims = [
        ...(resAB.object.supporting_claims || []),
        ...(resBA.object.supporting_claims || []),
      ];

      return {
        candidate_a: candA,
        candidate_b: candB,
        forward_winner: winAB,
        forward_confidence: resAB.object.confidence,
        reverse_winner: winBA,
        reverse_confidence: resBA.object.confidence,
        resolved_outcome: resolvedOutcome,
        decisive_reasons: combinedReasons,
        supporting_claims: combinedClaims,
      };
    }
  );

  for (const m of evaluatedMatchups) {
    pairwiseMatchups.push(m);
    const key = `${m.candidate_a}::${m.candidate_b}`;
    headToHeadMatrix.set(key, m.resolved_outcome);

    if (m.resolved_outcome === "a_wins") {
      pairwiseWinsMap.set(m.candidate_a, (pairwiseWinsMap.get(m.candidate_a) || 0) + 1);
      pairwiseLossesMap.set(m.candidate_b, (pairwiseLossesMap.get(m.candidate_b) || 0) + 1);
      pairwiseNotesMap.get(m.candidate_a)?.push(`Decisively defeated ${m.candidate_b}: ${m.decisive_reasons}`);
    } else if (m.resolved_outcome === "b_wins") {
      pairwiseWinsMap.set(m.candidate_b, (pairwiseWinsMap.get(m.candidate_b) || 0) + 1);
      pairwiseLossesMap.set(m.candidate_a, (pairwiseLossesMap.get(m.candidate_a) || 0) + 1);
      pairwiseNotesMap.get(m.candidate_b)?.push(`Decisively defeated ${m.candidate_a}: ${m.decisive_reasons}`);
    } else {
      pairwiseTiesMap.set(m.candidate_a, (pairwiseTiesMap.get(m.candidate_a) || 0) + 1);
      pairwiseTiesMap.set(m.candidate_b, (pairwiseTiesMap.get(m.candidate_b) || 0) + 1);
      pairwiseNotesMap.get(m.candidate_a)?.push(`Positional tie with ${m.candidate_b}: ${m.decisive_reasons}`);
      pairwiseNotesMap.get(m.candidate_b)?.push(`Positional tie with ${m.candidate_a}: ${m.decisive_reasons}`);
    }

    for (const c of m.supporting_claims) {
      if (c.candidate_id && c.ref_id) {
        pairwiseCitationsMap.get(cleanCandidateId(c.candidate_id))?.push(c.ref_id);
      }
    }
  }

  // 6. Stage 3C: Top 3 Resolution (Confident vs. Contested) and O(1) Quote Hydration
  const scoredCandidates = top5FinalistIds.map((cid) => {
    const wins = pairwiseWinsMap.get(cid) || 0;
    const ties = pairwiseTiesMap.get(cid) || 0;
    const losses = pairwiseLossesMap.get(cid) || 0;
    const points = wins * 2 + ties * 1;
    const latinRank = avgLatinSquareRankMap.get(cid) || 999;

    return {
      candidate_id: cid,
      points,
      wins,
      ties,
      losses,
      latinRank,
    };
  });

  // Sort candidates by pairwise points, then head-to-head match, then Latin-square average rank
  scoredCandidates.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;

    const keyAB = `${a.candidate_id}::${b.candidate_id}`;
    const keyBA = `${b.candidate_id}::${a.candidate_id}`;
    const directOutcome = headToHeadMatrix.get(keyAB) || (headToHeadMatrix.get(keyBA) === "a_wins" ? "b_wins" : headToHeadMatrix.get(keyBA) === "b_wins" ? "a_wins" : null);

    if (directOutcome === "a_wins") return -1;
    if (directOutcome === "b_wins") return 1;

    if (a.latinRank !== b.latinRank) return a.latinRank - b.latinRank;
    return a.candidate_id.localeCompare(b.candidate_id);
  });

  // Evaluate boundary between #3 and #4 to determine confident vs. contested Top 3
  const hasContender4 = scoredCandidates.length >= 4;
  let top3Status: "confident" | "contested" = "confident";
  let contestedBoundaryPair: [string, string] | null = null;

  if (hasContender4) {
    const cand3 = scoredCandidates[2];
    const cand4 = scoredCandidates[3];

    const key34 = `${cand3.candidate_id}::${cand4.candidate_id}`;
    const key43 = `${cand4.candidate_id}::${cand3.candidate_id}`;
    const directMatch = headToHeadMatrix.get(key34) || (headToHeadMatrix.get(key43) === "a_wins" ? "b_wins" : headToHeadMatrix.get(key43) === "b_wins" ? "a_wins" : null);

    const directTie = directMatch === "tie";
    const equalPoints = cand3.points === cand4.points;

    if (directTie || equalPoints) {
      top3Status = "contested";
      contestedBoundaryPair = [cand3.candidate_id, cand4.candidate_id];
    }
  }

  // Also verify #1 and #2 didn't tie on order flips
  if (scoredCandidates.length >= 2) {
    const cand1 = scoredCandidates[0];
    const cand2 = scoredCandidates[1];
    const key12 = `${cand1.candidate_id}::${cand2.candidate_id}`;
    const key21 = `${cand2.candidate_id}::${cand1.candidate_id}`;
    const directMatch12 = headToHeadMatrix.get(key12) || (headToHeadMatrix.get(key21) === "a_wins" ? "b_wins" : headToHeadMatrix.get(key21) === "b_wins" ? "a_wins" : null);
    if (directMatch12 === "tie" && cand1.points === cand2.points) {
      top3Status = "contested";
    }
  }

  // Build top candidates entries
  const topCandidateEntries: TopCandidateEntry[] = [];
  const entriesToInclude = top3Status === "contested" && hasContender4 ? 4 : Math.min(3, scoredCandidates.length);

  for (let idx = 0; idx < entriesToInclude; idx++) {
    const sc = scoredCandidates[idx];
    const isContestedEntry =
      contestedBoundaryPair !== null &&
      (sc.candidate_id === contestedBoundaryPair[0] || sc.candidate_id === contestedBoundaryPair[1]);

    const otherContestedId =
      isContestedEntry && contestedBoundaryPair
        ? sc.candidate_id === contestedBoundaryPair[0]
          ? contestedBoundaryPair[1]
          : contestedBoundaryPair[0]
        : null;

    // Collect all supporting citations for this candidate
    const citedRefs: string[] = [];
    const pairwiseRefs = pairwiseCitationsMap.get(sc.candidate_id) || [];
    citedRefs.push(...pairwiseRefs);

    // Collect refs from Latin-Square permutations
    for (const ls of latinSquareTelemetries) {
      const entry = ls.rankings.find((r) => r.candidate_id === sc.candidate_id);
      if (entry?.supporting_refs) {
        citedRefs.push(...entry.supporting_refs);
      }
    }

    // Collect refs from Stage 2 halving rounds
    for (const round of stage2RoundsTelemetry) {
      for (const group of round.groups) {
        const evalItem = group.evaluations.find((e) => e.candidate_id === sc.candidate_id);
        if (evalItem?.supporting_refs) {
          citedRefs.push(...evalItem.supporting_refs);
        }
      }
    }

    const hydratedClaims = hydrateSupportingClaims(sc.candidate_id, citedRefs, poolMap);

    const notes = pairwiseNotesMap.get(sc.candidate_id) || [];
    const mainNote = notes.length > 0 ? notes[0] : `Scored ${sc.points} pairwise points with average Latin-square rank ${sc.latinRank}.`;

    const rankNumber = isContestedEntry && idx === 3 ? 3 : idx + 1;

    topCandidateEntries.push({
      rank: rankNumber,
      candidate_id: sc.candidate_id,
      status: isContestedEntry ? "contested" : "confident",
      pairwise_wins: sc.wins,
      pairwise_ties: sc.ties,
      pairwise_losses: sc.losses,
      latin_square_avg_rank: sc.latinRank,
      headline_rationale: isContestedEntry
        ? `Contested standing with ${otherContestedId}: ${mainNote}`
        : mainNote,
      contested_with: otherContestedId,
      supporting_claims: hydratedClaims,
    });
  }

  // Construct executive summary
  let summaryText = "";
  if (top3Status === "confident") {
    const topIds = topCandidateEntries.map((e) => e.candidate_id).join(", ");
    summaryText = `Top 3 candidates resolved with high confidence across Latin-square permutations and bidirectional pairwise verification: ${topIds}.`;
  } else if (contestedBoundaryPair) {
    summaryText = `Top 2 candidates are confident; #3 is contested between ${contestedBoundaryPair[0]} and ${contestedBoundaryPair[1]} due to positional ties in bidirectional pairwise comparisons.`;
  } else {
    summaryText = `Top rankings resolved with contested boundaries across candidates due to balanced head-to-head records.`;
  }

  const finalRankingResult: TopCandidatesRankingResult = TopCandidatesRankingResultSchema.parse({
    top3_status: top3Status,
    summary: summaryText,
    top_candidates: topCandidateEntries,
    emergent_axes: emergentAxes,
    telemetry: {
      stage0_viable_count: stage0ViableCount,
      stage0_knocked_out: knockedOutCandidates.map((c) => ({
        candidate_id: c.candidateId,
        candidate_name: c.candidateName,
        contradictions: c.contradictions,
      })),
      stage2_rounds: stage2RoundsTelemetry,
      stage3_finalist_ids: finalistIds,
      stage3_latin_square_orderings: latinSquareTelemetries,
      stage3_top5_candidate_ids: top5FinalistIds,
      stage3_pairwise_matchups: pairwiseMatchups,
    },
  });

  const totalLatencyMs = Math.round(performance.now() - startTime);

  return {
    ranking: finalRankingResult,
    usage: {
      promptTokens: totalInputTokens,
      completionTokens: totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
    },
    totalLatencyMs,
    warnings,
  };
}

// Convenience wrapper returning only the final TopCandidatesRankingResult
export async function rankTopCandidates(
  options: RankTopCandidatesOptions
): Promise<TopCandidatesRankingResult> {
  const res = await rankTopCandidatesWithUsage(options);
  return res.ranking;
}
