import { z } from "zod";
import { EvidenceSpanSchema } from "../shared/evidenceStatus";

export const CandidateQueryEvaluationSchema = z.object({
  candidate_id: z
    .string()
    .describe("Unique ID of the candidate evaluated in this batch"),
  status: z
    .enum(["confirmed", "inferred", "ambiguous", "contradicted", "not_stated", "unparseable"])
    .describe("Evidentiary status for this candidate against the query/requirement"),
  reasoning: z
    .string()
    .describe("One-sentence justification grounded only in the candidate's structured profile"),
  evidence_span: EvidenceSpanSchema
    .nullable()
    .describe("Literal quoted text supporting the status, or null if not_stated"),
});

export const QueryEvaluationExtractionSchema = z.object({
  evaluations: z
    .array(CandidateQueryEvaluationSchema)
    .describe("Evaluation results for every candidate in the batch"),
});

export type CandidateQueryEvaluation = z.infer<typeof CandidateQueryEvaluationSchema>;
export type QueryEvaluationExtraction = z.infer<typeof QueryEvaluationExtractionSchema>;

/**
 * Builds the batched query evaluation prompt for matching candidates against requirements.
 */
export function buildQueryEvaluationPrompt(queryText: string, candidateProfilesBatchJson: string): string {
  return `You are evaluating a batch of candidates against the following query/requirement. For EVERY candidate in the batch — qualifying and non-qualifying alike — return a status and a one-sentence reasoning grounded ONLY in the structured profile data provided. Do not invent facts not present in the profile. If the profile doesn't contain enough information to judge, return status "not_stated" or "ambiguous" rather than guessing. If status is "not_stated", return null for evidence_span.

Query/requirement:
${queryText}

Candidate profiles (compact, already extracted — NOT raw resumes):
${candidateProfilesBatchJson}`;
}

export const queryEvaluationAspect = {
  name: "query_evaluation",
  version: "1.0.0",
  schema: QueryEvaluationExtractionSchema,
  prompt: buildQueryEvaluationPrompt,
} as const;

