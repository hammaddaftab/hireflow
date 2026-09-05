import { z } from "zod";

export const LinkPlatformEnum = z.enum([
  "github",
  "linkedin",
  "gitlab",
  "portfolio",
  "twitter",
  "other",
]);

export type LinkPlatform = z.infer<typeof LinkPlatformEnum>;

export const LinkPlatformNormalizedSchema = z.object({
  raw: z
    .string()
    .nullable()
    .describe("Stated provider or platform name in document (e.g. 'GitHub', 'Portfolio'), else null"),
  normalized: LinkPlatformEnum
    .nullable()
    .describe("Canonical platform enum identifier, or null if unrecognized"),
});

export const LinkItemSchema = z.object({
  address: z
    .string()
    .describe("Raw profile, portfolio, or code URL string from document (not fetched or validated)"),
  platform: LinkPlatformNormalizedSchema.describe(
    "Normalized platform classification structured as { raw, normalized }"
  ),
});

export const NormalizedLocationSchema = z.object({
  raw: z
    .string()
    .nullable()
    .describe("Raw candidate location or city as explicitly stated in the document, else null"),
  normalized: z
    .object({
      city: z
        .string()
        .nullable()
        .describe("Canonical city name (e.g. 'Lahore'), or null if unresolvable"),
      province: z
        .string()
        .nullable()
        .describe("Canonical province or region (e.g. 'Punjab'), or null if unresolvable"),
    })
    .nullable()
    .describe("Structured canonical location matching job-side schema; top-level raw is kept flat to avoid unnecessary depth"),
});

export type LinkPlatformNormalized = z.infer<typeof LinkPlatformNormalizedSchema>;
export type LinkItem = z.infer<typeof LinkItemSchema>;
export type NormalizedLocation = z.infer<typeof NormalizedLocationSchema>;

/**
 * Candidate Identity Extraction Schema.
 * Extracts explicit identity fields with { raw, normalized } representation
 * for location and link platforms.
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
  location: NormalizedLocationSchema.describe(
    "Candidate's location structured as { raw, normalized: { city, province } }"
  ),
  links: z
    .array(LinkItemSchema)
    .default([])
    .describe("Candidate profile, portfolio, and code URLs structured as { address, platform: { raw, normalized } }"),
});

export type IdentityExtraction = z.infer<typeof IdentityExtractionSchema>;

// Builds the extraction prompt or instructions for Candidate Identity
export function buildIdentityPrompt(resumeText?: string): string {
  const instructions = `Extract the candidate's identity fields:
- raw: verbatim stated location string from document (e.g. 'Gulberg III, Lahore, Pakistan', 'DHA Phase 5, Karachi', 'F-7, Islamabad', or null if unstated).
- normalized: an object with:
  * city: canonical city name (e.g. 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Faisalabad', 'Quetta') resolved from neighborhoods, addresses, or airport codes, else null.
  * province: canonical province, territory, or state (e.g. 'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory') if determinable, else null.
Return only what is explicitly present — do not infer a name from an email address, do not guess a phone country code if not shown.
Normalize phone numbers to E.164 if a country context is clear from the document; otherwise return the raw string and flag it.
For links: for each link entry, return:
- address: the raw URL or web address string.
- platform: an object containing 'raw' (the provider name as stated, e.g. 'GitHub', 'Portfolio', or null) and 'normalized' (canonical enum: 'github', 'linkedin', 'gitlab', 'portfolio', 'twitter', 'other', or null).`;

  return resumeText ? `${instructions}\n\nResume text:\n${resumeText}` : instructions;
}

export const identityAspect = {
  name: "identity",
  version: "1.0.0",
  schema: IdentityExtractionSchema,
  prompt: buildIdentityPrompt,
} as const;


