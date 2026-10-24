// API route for Mechanism E Top Candidates Tournament
// Provides instant seeded tournament results, live multi-pass LLM execution, and pool-keyed live caching

import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { jobsService } from "@/features/jobs/jobsService";
import { candidatesService } from "@/services/candidatesService";
import { buildInstantTopCandidatesRanking } from "@/features/review/top-candidates/instantTopCandidatesService";
import { PRECOMPUTED_GRAD_AI_TOURNAMENT } from "@/features/review/top-candidates/precomputedGradAiTournament";
import { rankTopCandidatesWithUsage } from "@/lib/extraction/ranking/rankTopCandidates";
import type { TopCandidatesRankingResult } from "@/entities/extraction/matching/topCandidatesRanking";
import type { ParsedCandidateProfile } from "@/entities/candidate";

export const maxDuration = 120;

const LIVE_CACHE_FILE = resolve(".uploads/top-candidates-live-cache.json");
const BENCH_CVS_DIR = resolve("docs/research/top-candidates/bench/cvs");

// In-memory + disk cache keyed by jobId + sorted candidate IDs
const memoryLiveCache = new Map<string, TopCandidatesRankingResult>();

function buildPoolKey(jobId: string, candidates: ParsedCandidateProfile[]): string {
  const sortedIds = candidates.map((c) => c.id).sort().join(",");
  return `${jobId}::${sortedIds}`;
}

function getCachedLiveRanking(poolKey: string): TopCandidatesRankingResult | null {
  if (memoryLiveCache.has(poolKey)) {
    return memoryLiveCache.get(poolKey)!;
  }
  try {
    if (existsSync(LIVE_CACHE_FILE)) {
      const diskData = JSON.parse(readFileSync(LIVE_CACHE_FILE, "utf-8")) as Record<
        string,
        TopCandidatesRankingResult
      >;
      if (diskData[poolKey]) {
        memoryLiveCache.set(poolKey, diskData[poolKey]);
        return diskData[poolKey];
      }
    }
  } catch {
    // Ignore corrupt disk cache
  }
  return null;
}

function saveCachedLiveRanking(poolKey: string, ranking: TopCandidatesRankingResult): void {
  memoryLiveCache.set(poolKey, ranking);
  try {
    mkdirSync(resolve(".uploads"), { recursive: true });
    let diskData: Record<string, TopCandidatesRankingResult> = {};
    if (existsSync(LIVE_CACHE_FILE)) {
      try {
        diskData = JSON.parse(readFileSync(LIVE_CACHE_FILE, "utf-8"));
      } catch {
        diskData = {};
      }
    }
    diskData[poolKey] = ranking;
    writeFileSync(LIVE_CACHE_FILE, JSON.stringify(diskData, null, 2), "utf-8");
  } catch {
    // Ignore disk write errors in read-only environments
  }
}

// Identifies newly dropped candidates when the base 30-candidate or 9-candidate pool is active
function findUnrankedCandidates(candidates: ParsedCandidateProfile[]): ParsedCandidateProfile[] {
  const ids = new Set(candidates.map((c) => c.id));
  const hasGradAi30Base =
    ids.has("cand_25_muhammad_abdullah") &&
    ids.has("cand_14_jatindar_kumar_mamnani") &&
    ids.has("cand_27_muhammad_taha_mukhtar") &&
    ids.has("cand_20_ali_awais_safdar");

  if (hasGradAi30Base) {
    return candidates.filter((c) => !/^cand_\d{2}_/.test(c.id));
  }

  const GOLDEN_9_IDS = new Set([
    "cand_tariq",
    "cand_hamza_gem",
    "cand_saad_stuffer",
    "cand_bilal_adjacent",
    "cand_usman_near_miss",
    "cand_ayesha_silent",
    "cand_farhan_out_of_band",
    "cand_omer_mixed",
    "cand_zainab_misses_pref",
  ]);
  const hasGoldenBase =
    ids.has("cand_tariq") &&
    ids.has("cand_zainab_misses_pref") &&
    ids.has("cand_hamza_gem");

  if (hasGoldenBase) {
    return candidates.filter((c) => !GOLDEN_9_IDS.has(c.id));
  }

  return [];
}

// Loads raw markdown CV text from bench/cvs when available for Stage 3 full-CV fidelity
function loadBenchRawTexts(candidates: ParsedCandidateProfile[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of candidates) {
    const mdPath = join(BENCH_CVS_DIR, `${c.id}.md`);
    if (existsSync(mdPath)) {
      try {
        map[c.id] = readFileSync(mdPath, "utf-8");
      } catch {
        // Fallback handled by formatCandidateFullCvText
      }
    }
  }
  return map;
}

// Helper to determine if live AI execution is available
function checkCanRunLive(): boolean {
  const isOffline = process.env.AI_OFFLINE === "true";
  const hasKey = Boolean(
    process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
  return hasKey && !isOffline;
}

// GET /api/jobs/[id]/top-candidates - Returns cached live or instant precomputed tournament ranking
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await jobsService.getJobById(id);

    if (!job) {
      return NextResponse.json(
        { error: `Job with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const jobCandidates = await candidatesService.getAllCandidates({ jobId: id });
    const candidates =
      jobCandidates.length > 0
        ? jobCandidates
        : await candidatesService.getAllCandidates();

    const canRunLive = checkCanRunLive();
    const candidateMap = Object.fromEntries(candidates.map((c) => [c.id, c]));
    const poolKey = buildPoolKey(id, candidates);

    // 1. If a live tournament was already run for this exact pool, return it immediately
    const cachedLive = getCachedLiveRanking(poolKey);
    if (cachedLive) {
      return NextResponse.json({
        ranking: cachedLive,
        mode: "live",
        canRunLive,
        candidateMap,
        unrankedCandidateIds: [],
        unrankedCandidateNames: [],
      });
    }

    // 2. Check if new candidates were dropped into a precomputed pool
    const unranked = findUnrankedCandidates(candidates);
    const ids = new Set(candidates.map((c) => c.id));
    const hasGradAi30Base =
      ids.has("cand_25_muhammad_abdullah") &&
      ids.has("cand_14_jatindar_kumar_mamnani") &&
      ids.has("cand_27_muhammad_taha_mukhtar") &&
      ids.has("cand_20_ali_awais_safdar");

    // Keep the rich precomputed 30-candidate tournament visible while flagging the new CVs for live ranking
    const ranking = hasGradAi30Base
      ? {
          ...PRECOMPUTED_GRAD_AI_TOURNAMENT,
          telemetry: {
            ...PRECOMPUTED_GRAD_AI_TOURNAMENT.telemetry,
            stage0_viable_count: candidates.length,
          },
        }
      : buildInstantTopCandidatesRanking(job, candidates);

    return NextResponse.json({
      ranking,
      mode: "instant",
      canRunLive,
      candidateMap,
      unrankedCandidateIds: unranked.map((c) => c.id),
      unrankedCandidateNames: unranked.map((c) => c.identity?.name || c.id),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to compute top candidates ranking: ${message}` },
      { status: 500 }
    );
  }
}

// POST /api/jobs/[id]/top-candidates - Runs live AI tournament across the compressed pool + newly dropped CVs
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await jobsService.getJobById(id);

    if (!job) {
      return NextResponse.json(
        { error: `Job with ID '${id}' not found` },
        { status: 404 }
      );
    }

    let body: { mode?: "instant" | "live"; seed?: number; rediscoverAxes?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // Empty or invalid body defaults to instant
    }

    const jobCandidates = await candidatesService.getAllCandidates({ jobId: id });
    const candidates =
      jobCandidates.length > 0
        ? jobCandidates
        : await candidatesService.getAllCandidates();

    const canRunLive = checkCanRunLive();
    const poolKey = buildPoolKey(id, candidates);

    if (body.mode === "live" && canRunLive) {
      try {
        const ids = new Set(candidates.map((c) => c.id));
        const hasGradAi30Base =
          ids.has("cand_25_muhammad_abdullah") &&
          ids.has("cand_14_jatindar_kumar_mamnani") &&
          ids.has("cand_27_muhammad_taha_mukhtar") &&
          ids.has("cand_20_ali_awais_safdar");

        // Reuse Stage 1 Emergent Axes when ranking on the 30-candidate pool unless explicitly asked to rediscover
        const precomputedAxesResult =
          hasGradAi30Base && !body.rediscoverAxes
            ? {
                pool_summary:
                  PRECOMPUTED_GRAD_AI_TOURNAMENT.emergent_pool_summary ||
                  "Discovered emergent differentiation axes across the candidate pool.",
                axes: PRECOMPUTED_GRAD_AI_TOURNAMENT.emergent_axes,
              }
            : undefined;

        const rawTextByCandidateId = loadBenchRawTexts(candidates);

        const res = await rankTopCandidatesWithUsage({
          job,
          candidates,
          emergentAxesResult: precomputedAxesResult,
          rawTextByCandidateId,
          digestTokenBudget: 200,
          concurrencyLimit: 16,
          seed: body.seed ?? 42,
        });

        saveCachedLiveRanking(poolKey, res.ranking);

        return NextResponse.json({
          ranking: res.ranking,
          usage: res.usage,
          totalLatencyMs: res.totalLatencyMs,
          warnings: res.warnings,
          mode: "live",
          canRunLive: true,
          unrankedCandidateIds: [],
          unrankedCandidateNames: [],
        });
      } catch (liveError) {
        const fallbackRanking = buildInstantTopCandidatesRanking(job, candidates);
        const liveErrorMessage =
          liveError instanceof Error ? liveError.message : "Live AI execution failed";

        return NextResponse.json({
          ranking: fallbackRanking,
          mode: "instant",
          canRunLive,
          warnings: [
            `Live tournament failed (${liveErrorMessage}). Fell back to deterministic instant ranking.`,
          ],
          unrankedCandidateIds: [],
          unrankedCandidateNames: [],
        });
      }
    }

    const ranking = buildInstantTopCandidatesRanking(job, candidates);
    const warnings: string[] = [];
    if (body.mode === "live" && !canRunLive) {
      warnings.push(
        "Live AI execution is not available (missing API key or offline mode). Used deterministic instant ranking."
      );
    }

    return NextResponse.json({
      ranking,
      mode: "instant",
      canRunLive,
      warnings,
      unrankedCandidateIds: [],
      unrankedCandidateNames: [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to execute top candidates tournament: ${message}` },
      { status: 500 }
    );
  }
}
