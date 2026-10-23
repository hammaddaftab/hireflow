import "server-only";
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
  RoleClaimsExtractionSchema,
  roleClaimsAspect,
} from "@/entities/extraction/candidate/aspects/roleClaims";
import {
  NotableSignalsExtractionSchema,
  notableSignalsAspect,
} from "@/entities/extraction/candidate/aspects/notableSignals";
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
import { normalizeUniversity } from "../normalizers/universityNormalizer";
import { normalizeFieldOfStudy } from "../normalizers/fieldOfStudyNormalizer";
import { normalizeSkill, resolveCanonicalSkill } from "../normalizers/skillNormalizer";

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
  timeoutMs?: number; // Timeout in ms; set to 0 or omit for infinite
  allowFallback?: boolean;
  createdAt?: string;
}

// Combined schema for the prompt-driven aspects of candidate extraction.
export const CandidatePromptAspectsSchema = z.object({
  identity: IdentityExtractionSchema,
  work_history: WorkHistoryExtractionSchema,
  education: EducationExtractionSchema,
  skills_demonstrated: SkillsDemonstratedExtractionSchema,
  skills_declared: SkillsDeclaredExtractionSchema,
  logistics: LogisticsExtractionSchema,
  role_claims: RoleClaimsExtractionSchema,
  notable_signals: NotableSignalsExtractionSchema,
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

7. ROLE CLAIMS:
${roleClaimsAspect.prompt()}

8. NOTABLE SIGNALS:
${notableSignalsAspect.prompt()}

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

export interface CandidateExtractionResult {
  profile: ParsedCandidateProfile;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
}

// Main candidate extraction service returning profile alongside LLM token usage
export async function extractCandidateProfileWithUsage(
  resumeText: string,
  options?: CandidateExtractionOptions
): Promise<CandidateExtractionResult> {
  const warnings: string[] = [];
  const fileHash =
    options?.fileHash ?? createHash("sha256").update(resumeText).digest("hex");
  const filename = options?.filename || "resume.pdf";
  const appliedJobId = options?.appliedJobId ?? null;
  // If timeoutMs is 0, negative, or unset, do not set abort signal (infinite timeout by default)
  const abortSignal =
    options?.timeoutMs && options.timeoutMs > 0
      ? AbortSignal.timeout(options.timeoutMs)
      : undefined;

  const effectiveProvider = options?.provider || (process.env.LLM_PROVIDER as AiProvider | undefined);

  // If explicit mock provider or offline mode is requested, run deterministic fallback immediately
  if (effectiveProvider === "mock" || process.env.AI_OFFLINE === "true") {
    return { profile: extractCandidateFallback(resumeText, options, warnings) };
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
    return { profile: extractCandidateFallback(resumeText, options, warnings) };
  }

  // Attempt structured extraction via AI SDK
  try {
    const languageModel = getLanguageModel({
      provider: options?.provider,
      model: options?.model,
    });

    const prompt = buildUnifiedCandidateExtractionPrompt(resumeText);
    const { object, usage } = await generateObject({
      model: languageModel,
      schema: CandidatePromptAspectsSchema,
      prompt,
      ...(abortSignal ? { abortSignal } : {}),
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

    // Whitespace normalizer for robust verbatim evidence substring comparison
    const normalizeWs = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    const normalizedResumeText = normalizeWs(resumeText);
    const validWorkEntryIds = new Set(
      (parsedAspects.work_history?.entries || []).map((e) => e.entry_id)
    );

    // Post-process role claims: assign sequential IDs, validate source refs and evidence, resolve canonical skills
    if (parsedAspects.role_claims?.claims) {
      parsedAspects.role_claims.claims.forEach((claim, idx) => {
        // Enforce deterministic sequential ID
        claim.claim_id = `c${idx + 1}`;

        // Validate source entry reference matches extracted work history
        if (!validWorkEntryIds.has(claim.source_entry_ref)) {
          warnings.push(
            `Claim '${claim.claim_id}' references unknown work_history entry '${claim.source_entry_ref}'`
          );
        }

        // Validate evidence span substring fidelity
        if (claim.evidence_span && !normalizedResumeText.includes(normalizeWs(claim.evidence_span))) {
          warnings.push(
            `Claim '${claim.claim_id}' evidence_span was not found verbatim in resume text`
          );
        }

        // Fill canonical skill using catalog normalizer
        if (claim.skills) {
          for (const item of claim.skills) {
            item.canonical_skill = resolveCanonicalSkill(item.skill);
          }
        }
      });
    }

    // Post-process notable signals: assign sequential IDs and validate evidence fidelity
    if (parsedAspects.notable_signals?.signals) {
      parsedAspects.notable_signals.signals.forEach((signal, idx) => {
        // Enforce deterministic sequential ID
        signal.signal_id = `s${idx + 1}`;

        // Validate evidence span substring fidelity
        if (signal.evidence_span && !normalizedResumeText.includes(normalizeWs(signal.evidence_span))) {
          warnings.push(
            `Signal '${signal.signal_id}' evidence_span was not found verbatim in resume text`
          );
        }
      });
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
      role_claims: parsedAspects.role_claims ?? { claims: [] },
      notable_signals: parsedAspects.notable_signals ?? { signals: [] },
      extraction_metadata: {
        file_hash: fileHash,
        aspect_versions: getCurrentAspectVersions(),
        extracted_at: new Date().toISOString(),
        parse_quality: "full",
        raw_text_ref: options?.fileUrl || `storage://resumes/${filename}`,
        warnings,
      },
    };

    return {
      profile: ParsedCandidateProfileSchema.parse(profile),
      usage: usage
        ? {
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          }
        : undefined,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[CandidateExtractionService] AI extraction failed (${reason}):`, err);
    warnings.push(`AI extraction unavailable (${reason}); executed deterministic fallback extraction engine.`);
    return { profile: extractCandidateFallback(resumeText, options, warnings) };
  }
}

// Main candidate extraction service preserving backward-compatible signature
export async function extractCandidateProfile(
  resumeText: string,
  options?: CandidateExtractionOptions
): Promise<ParsedCandidateProfile> {
  const result = await extractCandidateProfileWithUsage(resumeText, options);
  return result.profile;
}
