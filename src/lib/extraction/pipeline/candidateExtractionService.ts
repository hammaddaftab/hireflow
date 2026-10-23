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
  RoleClaimsPromptSchema,
  roleClaimsAspect,
  type ExtractedClaimSkill,
  type ExtractedRoleClaim,
} from "@/entities/extraction/candidate/aspects/roleClaims";
import {
  NotableSignalsPromptSchema,
  notableSignalsAspect,
  type ExtractedNotableSignal,
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

// Strips any [L\d+] marker prefixes from an extracted string
export function stripLineMarkers(s: string): string {
  return s.replace(/\[L\d+\]\s*/g, "");
}

// Pure line splitter numbering resume lines with L1, L2, ...
export function numberResumeLines(resumeText: string): {
  numberedText: string;
  lineMap: Map<string, string>;
} {
  const rawLines = resumeText.split(/\r?\n/);
  const lineMap = new Map<string, string>();
  const numberedLines: string[] = [];
  let lineCounter = 1;

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // If single line exceeds 280 characters and contains multiple sentences, split into sentence segments
    let segments = [trimmed];
    if (trimmed.length > 280) {
      const splitSentences = trimmed
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (splitSentences.length > 1) {
        segments = splitSentences;
      }
    }

    for (const segment of segments) {
      const id = `L${lineCounter++}`;
      lineMap.set(id, segment);
      numberedLines.push(`[${id}] ${segment}`);
    }
  }

  return {
    numberedText: numberedLines.join("\n"),
    lineMap,
  };
}

// Combined schema for the prompt-driven aspects of candidate extraction.
export const CandidatePromptAspectsSchema = z.object({
  identity: IdentityExtractionSchema,
  work_history: WorkHistoryExtractionSchema,
  education: EducationExtractionSchema,
  skills_demonstrated: SkillsDemonstratedExtractionSchema,
  skills_declared: SkillsDeclaredExtractionSchema,
  logistics: LogisticsExtractionSchema,
  role_claims: RoleClaimsPromptSchema,
  notable_signals: NotableSignalsPromptSchema,
});

export type CandidatePromptAspects = z.infer<typeof CandidatePromptAspectsSchema>;

// Builds unified extraction prompt covering all candidate aspects with numbered line references
export function buildUnifiedCandidateExtractionPrompt(numberedResumeText: string): string {
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

NOTE: Each line in <resume_text> starts with a line marker like [L1], [L2]. Use these IDs in evidence_lines for role_claims and notable_signals. Never include [L...] markers inside any extracted string field.

<resume_text>
${numberedResumeText}
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
  cleanupStats?: {
    fillerDropped: number;
    duplicatesDropped: number;
  };
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
}

// Main candidate extraction service returning profile alongside LLM token usage and cleanup statistics
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
    return {
      profile: extractCandidateFallback(resumeText, options, warnings),
      cleanupStats: { fillerDropped: 0, duplicatesDropped: 0 },
    };
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
    return {
      profile: extractCandidateFallback(resumeText, options, warnings),
      cleanupStats: { fillerDropped: 0, duplicatesDropped: 0 },
    };
  }

  // Attempt structured extraction via AI SDK
  try {
    const languageModel = getLanguageModel({
      provider: options?.provider,
      model: options?.model,
    });

    const { numberedText, lineMap } = numberResumeLines(resumeText);
    const prompt = buildUnifiedCandidateExtractionPrompt(numberedText);
    const { object, usage } = await generateObject({
      model: languageModel,
      schema: CandidatePromptAspectsSchema,
      prompt,
      ...(abortSignal ? { abortSignal } : {}),
    });

    const parsedAspects = object;

    // Sanitize dates and ongoing flags in work history, and strip accidental line markers
    if (parsedAspects.work_history?.entries) {
      for (const entry of parsedAspects.work_history.entries) {
        if (entry.end_date && /^(present|current|now|ongoing)$/i.test(entry.end_date.trim())) {
          entry.end_date = null;
          entry.is_current = true;
        }
        if (entry.raw_description) {
          entry.raw_description = stripLineMarkers(entry.raw_description);
        }
        if (entry.title) {
          entry.title = stripLineMarkers(entry.title);
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

    // Normalize demonstrated skills at extraction and strip line markers
    if (parsedAspects.skills_demonstrated?.skills) {
      for (const item of parsedAspects.skills_demonstrated.skills) {
        if (item.skill) {
          item.skill = normalizeSkill(item.skill);
        }
        if (item.evidence_span) {
          item.evidence_span = stripLineMarkers(item.evidence_span);
        }
      }
    }

    // Normalize declared skills at extraction and deduplicate
    if (parsedAspects.skills_declared?.skills_declared) {
      parsedAspects.skills_declared.skills_declared = Array.from(
        new Set(parsedAspects.skills_declared.skills_declared.map(normalizeSkill).filter(Boolean))
      );
    }

    let fillerDroppedCount = 0;
    let duplicatesDroppedCount = 0;

    const validWorkEntryIds = new Set(
      (parsedAspects.work_history?.entries || []).map((e) => e.entry_id)
    );

    // Hydrate and filter role claims: assign sequential IDs, validate refs, filter nouns, apply filler safety net
    const rawPromptClaims = parsedAspects.role_claims?.claims || [];
    const keptRoleClaims: ExtractedRoleClaim[] = [];

    for (const promptClaim of rawPromptClaims) {
      if (!validWorkEntryIds.has(promptClaim.source_entry_ref)) {
        warnings.push(
          `Claim references unknown work_history entry '${promptClaim.source_entry_ref}'`
        );
      }

      // Resolve evidence_span by joining lineMap.get(id) for valid IDs in evidence_lines
      const spanSegments: string[] = [];
      for (const lineId of promptClaim.evidence_lines || []) {
        const lineText = lineMap.get(lineId);
        if (lineText) {
          spanSegments.push(lineText.replace(/^[•\-*]\s*/, ""));
        } else {
          warnings.push(`Claim evidence_line '${lineId}' not found in numbered lineMap`);
        }
      }
      const evidenceSpan = spanSegments.join(" ") || promptClaim.compact_action;

      // Deduplicate skills case-insensitively and resolve canonical skill
      const seenSkillNames = new Set<string>();
      const dedupedSkills: ExtractedClaimSkill[] = [];
      for (const s of promptClaim.skills || []) {
        const trimmed = s.skill.trim();
        if (!trimmed) continue;
        const lower = trimmed.toLowerCase();
        if (seenSkillNames.has(lower)) continue;
        seenSkillNames.add(lower);
        dedupedSkills.push({
          skill: trimmed,
          syntactic_tier: s.syntactic_tier,
          canonical_skill: resolveCanonicalSkill(trimmed),
        });
      }

      // Filter raw_nouns: remove any noun matching a skill or already present inside compact_action
      const actionLower = (promptClaim.compact_action || "").toLowerCase();
      const filteredRawNouns = (promptClaim.raw_nouns || []).filter((noun) => {
        const trimmed = noun.trim();
        if (!trimmed) return false;
        const lower = trimmed.toLowerCase();
        if (seenSkillNames.has(lower)) return false;
        if (actionLower.includes(lower)) return false;
        return true;
      });

      // Filler safety net: drop claim if 0 skills, 0 raw_nouns, and no outcome_attached
      if (dedupedSkills.length === 0 && filteredRawNouns.length === 0 && !promptClaim.outcome_attached) {
        fillerDroppedCount++;
        continue;
      }

      keptRoleClaims.push({
        claim_id: `c${keptRoleClaims.length + 1}`,
        source_entry_ref: promptClaim.source_entry_ref,
        claim_tier: promptClaim.claim_tier,
        skills: dedupedSkills,
        raw_nouns: filteredRawNouns,
        compact_action: promptClaim.compact_action,
        outcome_attached: promptClaim.outcome_attached,
        evidence_span: evidenceSpan,
        evidence_lines: promptClaim.evidence_lines,
      });
    }

    // Hydrate and deduplicate notable signals: disjointness from work_history and education restatements
    const roleClaimEvidenceLines = new Set<string>();
    for (const c of rawPromptClaims) {
      for (const lineId of c.evidence_lines || []) {
        roleClaimEvidenceLines.add(lineId);
      }
    }

    const rawPromptSignals = parsedAspects.notable_signals?.signals || [];
    const keptNotableSignals: ExtractedNotableSignal[] = [];

    for (const signal of rawPromptSignals) {
      // If all evidence_lines are already used by a role claim, drop as duplicate
      const signalLines = signal.evidence_lines || [];
      if (
        signalLines.length > 0 &&
        signalLines.every((lineId) => roleClaimEvidenceLines.has(lineId))
      ) {
        duplicatesDroppedCount++;
        continue;
      }

      // Drop Education Depth if it merely restates degree/school without honor/medal/rank/scholarship/thesis keywords
      const isEduDepth = /education/i.test(signal.context_label);
      if (isEduDepth) {
        const combinedCheckText = `${signal.compact_action || ""} ${(signal.raw_nouns || []).join(" ")}`;
        const hasHonor = /medal|rank|top|cum laude|distinction|scholar|fellow|thesis|dissertation|dean|award|honor/i.test(
          combinedCheckText
        );
        if (!hasHonor) {
          duplicatesDroppedCount++;
          continue;
        }
      }

      // Remove from raw_nouns any item whose lowercase string is already in compact_action
      const signalActionLower = (signal.compact_action || "").toLowerCase();
      const filteredRawNouns = (signal.raw_nouns || []).filter((noun) => {
        const trimmed = noun.trim();
        if (!trimmed) return false;
        return !signalActionLower.includes(trimmed.toLowerCase());
      });

      // Hydrate evidence_span from lineMap
      const spanSegments: string[] = [];
      for (const lineId of signalLines) {
        const lineText = lineMap.get(lineId);
        if (lineText) {
          spanSegments.push(lineText.replace(/^[•\-*]\s*/, ""));
        } else {
          warnings.push(`Signal evidence_line '${lineId}' not found in numbered lineMap`);
        }
      }
      const evidenceSpan = spanSegments.join(" ") || signal.compact_action;

      keptNotableSignals.push({
        signal_id: `s${keptNotableSignals.length + 1}`,
        context_label: signal.context_label,
        syntactic_tier: signal.syntactic_tier,
        raw_nouns: filteredRawNouns,
        compact_action: signal.compact_action,
        outcome_attached: signal.outcome_attached,
        evidence_span: evidenceSpan,
        evidence_lines: signal.evidence_lines,
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
      role_claims: { claims: keptRoleClaims },
      notable_signals: { signals: keptNotableSignals },
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
      cleanupStats: {
        fillerDropped: fillerDroppedCount,
        duplicatesDropped: duplicatesDroppedCount,
      },
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
    return {
      profile: extractCandidateFallback(resumeText, options, warnings),
      cleanupStats: { fillerDropped: 0, duplicatesDropped: 0 },
    };
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
