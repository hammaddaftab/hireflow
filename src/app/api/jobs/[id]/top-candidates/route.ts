// API route for Mechanism E Top Candidates Tournament
// Provides instant seeded tournament results and live multi-pass LLM execution

import { NextRequest, NextResponse } from "next/server";
import { jobsService } from "@/features/jobs/jobsService";
import { candidatesService } from "@/services/candidatesService";
import { buildInstantTopCandidatesRanking } from "@/features/review/top-candidates/instantTopCandidatesService";
import { rankTopCandidatesWithUsage } from "@/lib/extraction/ranking/rankTopCandidates";

export const maxDuration = 60;

// Helper to determine if live AI execution is available
function checkCanRunLive(): boolean {
  const isOffline = process.env.AI_OFFLINE === "true";
  const hasKey = Boolean(
    process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
  return hasKey && !isOffline;
}

// GET /api/jobs/[id]/top-candidates - Returns instant deterministic tournament ranking
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

    // Load candidates for this job or all candidates if pool is global
    const jobCandidates = await candidatesService.getAllCandidates({ jobId: id });
    const candidates =
      jobCandidates.length > 0
        ? jobCandidates
        : await candidatesService.getAllCandidates();

    const ranking = buildInstantTopCandidatesRanking(job, candidates);
    const canRunLive = checkCanRunLive();
    const candidateMap = Object.fromEntries(candidates.map((c) => [c.id, c]));

    return NextResponse.json({
      ranking,
      mode: "instant",
      canRunLive,
      candidateMap,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to compute top candidates ranking: ${message}` },
      { status: 500 }
    );
  }
}

// POST /api/jobs/[id]/top-candidates - Runs instant or live AI tournament
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

    let body: { mode?: "instant" | "live"; seed?: number } = {};
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

    if (body.mode === "live" && canRunLive) {
      try {
        const res = await rankTopCandidatesWithUsage({
          job,
          candidates,
          seed: body.seed,
        });

        return NextResponse.json({
          ranking: res.ranking,
          usage: res.usage,
          totalLatencyMs: res.totalLatencyMs,
          warnings: res.warnings,
          mode: "live",
          canRunLive: true,
        });
      } catch (liveError) {
        // Fallback gracefully to instant seeded ranking if live tournament fails
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
        });
      }
    }

    // Default or instant mode
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to execute top candidates tournament: ${message}` },
      { status: 500 }
    );
  }
}
