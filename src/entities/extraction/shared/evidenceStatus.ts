import { z } from "zod";

/**
 * 6-state evidence status taxonomy.
 * Fixed set of states any extracted or matched field can be in.
 * Content-level: confirmed, inferred, contradicted, not_stated, ambiguous.
 * System-level: unparseable.
 */
export const EvidenceStatusSchema = z
  .enum([
    "confirmed",
    "inferred",
    "contradicted",
    "not_stated",
    "ambiguous",
    "unparseable",
  ])
  .describe("6-state evidence status taxonomy");

export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

/**
 * Literal quoted text supporting the status.
 */
export const EvidenceSpanSchema = z
  .string()
  .describe("Literal quoted text supporting the status");

export type EvidenceSpan = z.infer<typeof EvidenceSpanSchema>;
