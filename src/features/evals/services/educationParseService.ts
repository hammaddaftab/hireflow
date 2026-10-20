import { generateObject } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import {
  EducationExtractionSchema,
  type EducationExtraction,
  buildEducationPrompt,
} from "@/entities/extraction/candidate/aspects/education";
import { normalizeUniversity, normalizeFieldOfStudy } from "@/lib/extraction/server";

export interface EducationEntryComparison {
  index: number;
  rawInstitution: string;
  canonicalInstitution: string | null;
  institutionMatchMethod: "EXACT_ALIAS" | "TOKEN_SORT_FUZZY" | "UNRESOLVED";
  institutionConfidence: number;
  isInstitutionUnverified: boolean;
  rawField: string;
  canonicalField: string | null;
  rawDegree: string;
  normalizedDegreeTier: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  grade: string | null;
}

export interface EducationParseResult {
  durationMs: number;
  model: string;
  provider: string;
  directAiExtraction: EducationExtraction;
  normalizedExtraction: EducationExtraction;
  comparisons: EducationEntryComparison[];
  rawEntriesCount: number;
  normalizedEntriesCount: number;
  highestDegreeTier: string | null;
}

// Executes single-aspect Education extraction and traces pipeline normalization
export async function parseAndNormalizeEducation(
  resumeText: string
): Promise<EducationParseResult> {
  const modelInstance = getLanguageModel({ provider: "openai" });
  const modelName = process.env.OPENAI_MODEL || "gpt-5.6-luna";

  const prompt = buildEducationPrompt(resumeText);
  const startTime = Date.now();

  const { object } = await generateObject({
    model: modelInstance,
    schema: EducationExtractionSchema,
    prompt,
    abortSignal: AbortSignal.timeout(45000),
  });

  const durationMs = Date.now() - startTime;

  // Clone direct AI extraction before post-processing pipeline
  const directAiExtraction: EducationExtraction = JSON.parse(JSON.stringify(object));

  // Run normalization pipeline mirroring production candidateExtractionService
  const normalizedExtraction: EducationExtraction = JSON.parse(JSON.stringify(object));
  const comparisons: EducationEntryComparison[] = [];

  for (let i = 0; i < normalizedExtraction.entries.length; i++) {
    const entry = normalizedExtraction.entries[i];
    const directEntry = directAiExtraction.entries[i];

    // Sanitize dates
    if (
      entry.end_date &&
      /^(present|current|now|ongoing)$/i.test(entry.end_date.trim())
    ) {
      entry.end_date = null;
      entry.is_current = true;
    }

    // Step 1: Normalize university title via catalog
    const rawUni = entry.institution?.raw || "";
    const uniResolution = normalizeUniversity(rawUni);
    entry.institution.normalized = uniResolution.canonical_name;

    // Step 2: Normalize field of study
    const rawField = entry.field?.raw || entry.field?.normalized || "";
    const canonicalField = normalizeFieldOfStudy(rawField);
    entry.field.normalized = canonicalField;

    comparisons.push({
      index: i + 1,
      rawInstitution: rawUni,
      canonicalInstitution: uniResolution.canonical_name,
      institutionMatchMethod: uniResolution.match_method,
      institutionConfidence: uniResolution.confidence,
      isInstitutionUnverified: uniResolution.is_unverified,
      rawField,
      canonicalField,
      rawDegree: entry.degree_level?.raw || "",
      normalizedDegreeTier: entry.degree_level?.normalized || directEntry.degree_level?.normalized || null,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current,
      grade: entry.grade,
    });
  }

  const DEGREE_RANKS: Record<string, number> = {
    high_school: 1,
    diploma: 2,
    bachelors: 3,
    masters: 4,
    doctorate: 5,
  };

  let highestDegreeTier: string | null = null;
  let highestRank = 0;
  for (const entry of normalizedExtraction.entries) {
    const tier = entry.degree_level?.normalized;
    if (tier && (DEGREE_RANKS[tier] || 0) > highestRank) {
      highestRank = DEGREE_RANKS[tier] || 0;
      highestDegreeTier = tier;
    }
  }

  return {
    durationMs,
    model: modelName,
    provider: "openai",
    directAiExtraction,
    normalizedExtraction,
    comparisons,
    rawEntriesCount: directAiExtraction.entries.length,
    normalizedEntriesCount: normalizedExtraction.entries.length,
    highestDegreeTier,
  };
}
