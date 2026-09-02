import { z } from "zod";

/**
 * Candidate Identity Extraction Schema.
 * Extracts explicit identity fields without guessing or inferring missing data.
 */
export const IdentityExtractionSchema = z.object({
  name: z
    .string()
    .describe("Candidate's full name as explicitly stated in the document"),
  email: z
    .string()
    .nullable()
    .describe("Contact email address if explicitly present, else null"),
  phone: z
    .string()
    .nullable()
    .describe("Phone number normalized to E.164 if country context is clear, else raw string, or null"),
  cnic: z
    .string()
    .nullable()
    .describe("13-digit Pakistani CNIC number used as primary dedup key, or null if not present"),
  location_stated: z
    .string()
    .nullable()
    .describe("Candidate's current location or city if explicitly stated, else null"),
  links: z
    .array(z.string())
    .default([])
    .describe("Raw profile, portfolio, and code URLs (e.g. GitHub, LinkedIn) without fetching or validating"),
});

export type IdentityExtraction = z.infer<typeof IdentityExtractionSchema>;

/**
 * Builds the extraction prompt for Candidate Identity.
 */
export function buildIdentityPrompt(resumeText: string): string {
  return `Extract the candidate's identity fields from the resume text below.
Return only what is explicitly present — do not infer a name from an email address, do not guess a phone country code if not shown.
Normalize phone numbers to E.164 if a country context is clear from the document; otherwise return the raw string and flag it.
Do not fetch or validate any URLs found — return them raw.

Resume text:
${resumeText}`;
}

export const identityAspect = {
  name: "identity",
  schema: IdentityExtractionSchema,
  prompt: buildIdentityPrompt,
} as const;
