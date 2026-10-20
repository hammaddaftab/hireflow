export const dynamic = "force-dynamic";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;


import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";
import {
  normalizeUniversity,
  stripCampusSuffix,
  pruneAndSortTokens,
} from "@/lib/extraction/normalizers/universityNormalizer";
import { sanitizeText } from "@/lib/matching/stringSimilarity";
import {
  normalizeFieldOfStudy,
  isFieldEquivalent,
} from "@/lib/extraction/normalizers/fieldOfStudyNormalizer";

// Helper to determine degree tier
function normalizeDegreeLevel(raw: string): {
  tier: "doctorate" | "masters" | "bachelors" | "diploma" | "high_school" | null;
  reason: string;
} {
  const clean = raw.trim().toLowerCase();
  if (/\b(phd|doctorate|doctor of philosophy|dphil)\b/i.test(clean)) {
    return { tier: "doctorate", reason: "Matched doctoral tier (PhD / Doctorate)" };
  }
  if (/\b(master|ms|msc|m\.s|mphil|mba|m\.eng)\b/i.test(clean)) {
    return { tier: "masters", reason: "Matched master degree tier (MS / MSc / MBA / MPhil)" };
  }
  if (/\b(bachelor|bs|bsc|b\.s|b\.e|bba|be|software engineering|computer science|undergraduate)\b/i.test(clean)) {
    return { tier: "bachelors", reason: "Matched 4-year undergraduate bachelors tier (BS / BSc / BE / BBA)" };
  }
  if (/\b(dae|diploma|associate degree|adp|associate)\b/i.test(clean)) {
    return { tier: "diploma", reason: "Matched 2-year associate degree or polytechnic diploma (ADP / DAE)" };
  }
  if (/\b(fsc|ics|fa|matric|o-levels|a-levels|intermediate|hssc|ssc|high school)\b/i.test(clean)) {
    return { tier: "high_school", reason: "Matched intermediate or secondary high school qualification (FSc / ICS / A-Levels)" };
  }
  return { tier: null, reason: "Non-degree qualification, bootcamp, short certificate, or unclassified" };
}

const NormalizationPayloadSchema = z.object({
  target: z.enum(["university", "degree", "degree_level", "field"]),
  query: z.string().min(1, "Query text cannot be empty"),
});

// POST /api/evals/normalization
// Deterministic normalization testing for university titles, degree levels, and fields
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON request body", undefined, "/api/evals/normalization");
    }

    const parseResult = NormalizationPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      throw ApiError.badRequest(
        "Invalid normalization payload",
        parseResult.error.errors.map((e) => ({
          name: e.path.join("."),
          reason: e.message,
        })),
        "/api/evals/normalization"
      );
    }

    const { target, query } = parseResult.data;

    // Normalization path 1: University Title
    if (target === "university") {
      const strippedCampus = stripCampusSuffix(query);
      const sortedTokens = pruneAndSortTokens(sanitizeText(strippedCampus));
      const res = normalizeUniversity(query);

      return createSuccessResponse({
        target: "university",
        rawQuery: query,
        strippedCampus,
        sortedTokens,
        canonicalName: res.canonical_name,
        canonicalId: res.canonical_id,
        matchMethod: res.match_method,
        confidence: res.confidence,
        isUnverified: res.is_unverified,
      });
    }

    // Normalization path 2: Degree Level Tier Only
    if (target === "degree_level") {
      const degreeResult = normalizeDegreeLevel(query);

      return createSuccessResponse({
        target: "degree_level",
        rawQuery: query,
        degreeTier: degreeResult.tier,
        tierReason: degreeResult.reason,
      });
    }

    // Normalization path 3: Field of Study / Major Only
    if (target === "field") {
      const canonicalField = normalizeFieldOfStudy(query);
      const isCsEquivalent = isFieldEquivalent("Computer Science", canonicalField || query);

      return createSuccessResponse({
        target: "field",
        rawQuery: query,
        canonicalField,
        isCsEquivalent,
      });
    }

    // Normalization path 4: Combined Degree & Field (backward compatibility)
    if (target === "degree") {
      const degreeResult = normalizeDegreeLevel(query);
      const canonicalField = normalizeFieldOfStudy(query);
      const isCsEquivalent = isFieldEquivalent("Computer Science", canonicalField || query);

      return createSuccessResponse({
        target: "degree",
        rawQuery: query,
        degreeTier: degreeResult.tier,
        tierReason: degreeResult.reason,
        canonicalField,
        isCsEquivalent,
      });
    }

    throw ApiError.badRequest("Unknown normalization target", undefined, "/api/evals/normalization");
  } catch (error) {
    return createErrorResponse(error, "/api/evals/normalization");
  }
}
