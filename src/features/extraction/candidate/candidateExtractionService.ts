import { createHash, randomUUID } from "node:crypto";
import { generateObject } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import type { AiProvider } from "@/lib/ai/types";
import {
  type ParsedCandidateProfile,
  ParsedCandidateProfileSchema,
} from "@/features/candidates/types";
import {
  IdentityExtractionSchema,
  identityAspect,
} from "./aspects/identity";
import {
  WorkHistoryExtractionSchema,
  workHistoryAspect,
} from "./aspects/workHistory";
import {
  EducationExtractionSchema,
  educationAspect,
} from "./aspects/education";
import {
  SkillsDemonstratedExtractionSchema,
  skillsDemonstratedAspect,
} from "./aspects/skillsDemonstrated";
import {
  SkillsDeclaredExtractionSchema,
  skillsDeclaredAspect,
} from "./aspects/skillsDeclared";
import {
  LogisticsExtractionSchema,
  logisticsAspect,
} from "./aspects/logistics";
import {
  getCurrentAspectVersions,
} from "./aspects/extractionMetadata";
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

import { z } from "zod";

export interface CandidateExtractionOptions {
  model?: string;
  provider?: AiProvider;
  filename?: string;
  fileSizeBytes?: number;
  mimeType?: string;
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

/**
 * Recursively converts a Zod schema to an OpenAI-compatible strict structured outputs schema
 * by stripping .default(...) wrappers so all properties are explicitly marked as required.
 */
function toStrictJsonSchema<T extends z.ZodTypeAny>(schema: T): z.ZodTypeAny {
  if (schema instanceof z.ZodDefault) {
    return toStrictJsonSchema(schema.removeDefault());
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const newShape: Record<string, z.ZodTypeAny> = {};
    for (const [key, value] of Object.entries(shape)) {
      newShape[key] = toStrictJsonSchema(value as z.ZodTypeAny);
    }
    return z.object(newShape);
  }
  if (schema instanceof z.ZodArray) {
    return z.array(toStrictJsonSchema(schema.element));
  }
  return schema;
}

export const StrictCandidatePromptAspectsSchema = toStrictJsonSchema(CandidatePromptAspectsSchema);

/**
 * Builds unified extraction prompt covering all 6 candidate aspect requirements.
 */
export function buildUnifiedCandidateExtractionPrompt(resumeText: string): string {
  return `Extract a standardized candidate profile from the resume text below.
Strictly adhere to each aspect schema:

1. IDENTITY:
${identityAspect.prompt(resumeText)}

2. WORK HISTORY:
${workHistoryAspect.prompt(resumeText)}

3. EDUCATION:
${educationAspect.prompt(resumeText)}

4. SKILLS DEMONSTRATED:
${skillsDemonstratedAspect.prompt(resumeText)}

5. SKILLS DECLARED:
${skillsDeclaredAspect.prompt(resumeText)}

6. LOGISTICS:
${logisticsAspect.prompt(resumeText)}
`;
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
  const timeoutMs = options?.timeoutMs ?? 3000;

  const effectiveProvider = options?.provider || (process.env.AI_DEFAULT_PROVIDER as AiProvider | undefined);

  // If explicit mock provider or offline mode is requested, run deterministic fallback immediately
  if (effectiveProvider === "mock" || process.env.AI_OFFLINE === "true") {
    return extractCandidateFallback(resumeText, options, warnings);
  }

  // If no AI keys are configured in environment, run deterministic fallback immediately
  const hasAiKey = Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY
  );

  if (!hasAiKey && !options?.provider) {
    warnings.push("No AI provider API keys configured; executed deterministic fallback extraction engine.");
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
      schema: StrictCandidatePromptAspectsSchema,
      prompt,
      abortSignal: AbortSignal.timeout(timeoutMs),
    });

    const parsedAspects = CandidatePromptAspectsSchema.parse(object);

    const profile: ParsedCandidateProfile = {
      id: `cand_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      applied_job_id: appliedJobId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_document: {
        filename,
        file_size_bytes: options?.fileSizeBytes,
        mime_type: options?.mimeType || "application/pdf",
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
        raw_text_ref: `storage://resumes/${filename}`,
        warnings,
      },
    };

    return ParsedCandidateProfileSchema.parse(profile);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    warnings.push(`AI extraction unavailable (${reason}); executed deterministic fallback extraction engine.`);
    return extractCandidateFallback(resumeText, options, warnings);
  }
}
