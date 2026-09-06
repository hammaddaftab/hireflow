import { createHash, randomUUID } from "node:crypto";
import { generateObject } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import type { AiProvider } from "@/lib/ai/types";
import {
  type ParsedCandidateProfile,
  ParsedCandidateProfileSchema,
} from "@/entities/candidate";
import {
  IdentityExtractionSchema,
  identityAspect,
} from "@/entities/extraction/candidate/aspects/identity";
import {
  WorkHistoryExtractionSchema,
  workHistoryAspect,
} from "@/entities/extraction/candidate/aspects/workHistory";
import {
  EducationExtractionSchema,
  educationAspect,
} from "@/entities/extraction/candidate/aspects/education";
import {
  SkillsDemonstratedExtractionSchema,
  skillsDemonstratedAspect,
} from "@/entities/extraction/candidate/aspects/skillsDemonstrated";
import {
  SkillsDeclaredExtractionSchema,
  skillsDeclaredAspect,
} from "@/entities/extraction/candidate/aspects/skillsDeclared";
import {
  LogisticsExtractionSchema,
  logisticsAspect,
} from "@/entities/extraction/candidate/aspects/logistics";
import {
  getCurrentAspectVersions,
} from "@/entities/extraction/candidate/aspects/extractionMetadata";
import {
  findMatchingMockCandidate,
  extractIdentityHeuristic,
  extractWorkHistoryHeuristic,
  extractEducationHeuristic,
  extractSkillsDeclaredHeuristic,
  extractSkillsDemonstratedHeuristic,
  extractLogisticsHeuristic,
  extractCandidateFallback,
  type CandidateFallbackOptions,
} from "./heuristicExtraction";
import { normalizeUniversity } from "./universityNormalizer";
import { normalizeFieldOfStudy } from "./fieldOfStudyNormalizer";
import { normalizeSkill } from "./skillNormalizer";

import { z } from "zod";

export interface CandidateExtractionOptions {
  model?: string;
  provider?: AiProvider;
  filename?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  fileUrl?: string;
  appliedJobId?: string | null;
  fileHash?: string;
  timeoutMs?: number;
}

/**
 * Combined schema for the prompt-driven aspects of candidate extraction.
 */
export const CandidatePromptAspectsSchema = z.object({
  identity: IdentityExtractionSchema,
  work_history: WorkHistoryExtractionSchema,
  education: EducationExtractionSchema,
  skills_demonstrated: SkillsDemonstratedExtractionSchema,
  skills_declared: SkillsDeclaredExtractionSchema,
  logistics: LogisticsExtractionSchema,
});

export type CandidatePromptAspects = z.infer<typeof CandidatePromptAspectsSchema>;

// Builds unified extraction prompt covering all 6 candidate aspect requirements
export function buildUnifiedCandidateExtractionPrompt(resumeText: string): string {
  return `Extract a standardized candidate profile from the resume text provided in <resume_text> below.
Strictly adhere to each aspect schema:

1. IDENTITY:
${identityAspect.prompt()}

2. WORK HISTORY:
${workHistoryAspect.prompt()}

3. EDUCATION:
${educationAspect.prompt()}

4. SKILLS DEMONSTRATED:
${skillsDemonstratedAspect.prompt()}

5. SKILLS DECLARED:
${skillsDeclaredAspect.prompt()}

6. LOGISTICS:
${logisticsAspect.prompt()}

<resume_text>
${resumeText}
</resume_text>`;
}

export {
  findMatchingMockCandidate,
  extractIdentityHeuristic,
  extractWorkHistoryHeuristic,
  extractEducationHeuristic,
  extractSkillsDeclaredHeuristic,
  extractSkillsDemonstratedHeuristic,
  extractLogisticsHeuristic,
  extractCandidateFallback,
  type CandidateFallbackOptions,
};

/**
 * Main candidate extraction service.
 * Takes resume text, extracts all 7 candidate aspects conforming to ParsedCandidateProfileSchema.
 * Executes via AI SDK model if available, and provides robust fallback / mock handling so parsing never crashes.
 */
export async function extractCandidateProfile(
  resumeText: string,
  options?: CandidateExtractionOptions
): Promise<ParsedCandidateProfile> {
  const warnings: string[] = [];
  const fileHash =
    options?.fileHash ?? createHash("sha256").update(resumeText).digest("hex");
  const filename = options?.filename || "resume.pdf";
  const appliedJobId = options?.appliedJobId ?? null;
  const timeoutMs = options?.timeoutMs ?? 30000;

  const effectiveProvider = options?.provider || (process.env.LLM_PROVIDER as AiProvider | undefined);

  // If explicit mock provider or offline mode is requested, run deterministic fallback immediately
  if (effectiveProvider === "mock" || process.env.AI_OFFLINE === "true") {
    return extractCandidateFallback(resumeText, options, warnings);
  }

  // Verify API key is configured for the active provider
  const resolvedProvider = effectiveProvider || "openai";
  const hasKeyForProvider =
    resolvedProvider === "google"
      ? Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
      : resolvedProvider === "openai"
      ? Boolean(process.env.OPENAI_API_KEY)
      : true;

  if (!hasKeyForProvider && !options?.provider) {
    warnings.push(`No API key configured for provider '${resolvedProvider}'; executed deterministic fallback extraction engine.`);
    return extractCandidateFallback(resumeText, options, warnings);
  }

  // Attempt structured extraction via AI SDK
  try {
    const languageModel = getLanguageModel({
      provider: options?.provider,
      model: options?.model,
    });

    const prompt = buildUnifiedCandidateExtractionPrompt(resumeText);
    const { object } = await generateObject({
      model: languageModel,
      schema: CandidatePromptAspectsSchema,
      prompt,
      abortSignal: AbortSignal.timeout(timeoutMs),
    });

    const parsedAspects = object;

    // Sanitize dates and ongoing flags in work history
    if (parsedAspects.work_history?.entries) {
      for (const entry of parsedAspects.work_history.entries) {
        if (entry.end_date && /^(present|current|now|ongoing)$/i.test(entry.end_date.trim())) {
          entry.end_date = null;
          entry.is_current = true;
        }
      }
    }

    // Sanitize dates and normalize education institutions & fields
    if (parsedAspects.education?.entries) {
      for (const entry of parsedAspects.education.entries) {
        if (entry.end_date && /^(present|current|now|ongoing)$/i.test(entry.end_date.trim())) {
          entry.end_date = null;
          entry.is_current = true;
        }
        if (entry.institution?.raw) {
          const res = normalizeUniversity(entry.institution.raw);
          entry.institution.normalized = res.canonical_name;
        }
        const rawField = entry.field?.raw || entry.field?.normalized;
        if (rawField) {
          entry.field.normalized = normalizeFieldOfStudy(rawField);
        }
      }
    }

    // Normalize demonstrated skills at extraction
    if (parsedAspects.skills_demonstrated?.skills) {
      for (const item of parsedAspects.skills_demonstrated.skills) {
        if (item.skill) {
          item.skill = normalizeSkill(item.skill);
        }
      }
    }

    // Normalize declared skills at extraction and deduplicate
    if (parsedAspects.skills_declared?.skills_declared) {
      parsedAspects.skills_declared.skills_declared = Array.from(
        new Set(parsedAspects.skills_declared.skills_declared.map(normalizeSkill).filter(Boolean))
      );
    }

    const profile: ParsedCandidateProfile = {
      id: `cand_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      applied_job_id: appliedJobId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_document: {
        filename,
        file_size_bytes: options?.fileSizeBytes,
        mime_type: options?.mimeType || "application/pdf",
        url: options?.fileUrl,
      },
      identity: parsedAspects.identity,
      work_history: parsedAspects.work_history,
      education: parsedAspects.education,
      skills_demonstrated: parsedAspects.skills_demonstrated,
      skills_declared: parsedAspects.skills_declared,
      logistics: parsedAspects.logistics,
      extraction_metadata: {
        file_hash: fileHash,
        aspect_versions: getCurrentAspectVersions(),
        extracted_at: new Date().toISOString(),
        parse_quality: "full",
        raw_text_ref: options?.fileUrl || `storage://resumes/${filename}`,
        warnings,
      },
    };

    return ParsedCandidateProfileSchema.parse(profile);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[CandidateExtractionService] AI extraction failed (${reason}):`, err);
    warnings.push(`AI extraction unavailable (${reason}); executed deterministic fallback extraction engine.`);
    return extractCandidateFallback(resumeText, options, warnings);
  }
}
