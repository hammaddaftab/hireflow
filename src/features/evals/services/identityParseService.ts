import { generateObject } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import {
  IdentityExtractionSchema,
  type IdentityExtraction,
  buildIdentityPrompt,
} from "@/entities/extraction/candidate/aspects/identity";
import { normalizeLocation } from "@/lib/extraction/server";

export interface IdentityDiagnostic {
  level: "info" | "warning" | "error";
  code: string;
  title: string;
  detail: string;
}

export interface IdentityParseResult {
  durationMs: number;
  model: string;
  provider: string;
  directAiExtraction: IdentityExtraction;
  sanitizedIdentity: IdentityExtraction;
  summary: {
    hasName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasCnic: boolean;
    hasLocation: boolean;
    city: string | null;
    province: string | null;
    isFederalTerritory?: boolean;
    territoryLabel?: string;
    linksCount: number;
    platformsDetected: string[];
  };
  diagnostics: IdentityDiagnostic[];
}

// Executes single-aspect Candidate Identity extraction and normalization inspection
export async function parseAndNormalizeIdentity(
  resumeText: string
): Promise<IdentityParseResult> {
  const modelInstance = getLanguageModel({ provider: "openai" });
  const modelName = process.env.OPENAI_MODEL || "gpt-5.6-luna";

  const prompt = buildIdentityPrompt(resumeText);
  const startTime = Date.now();

  const { object } = await generateObject({
    model: modelInstance,
    schema: IdentityExtractionSchema,
    prompt,
    abortSignal: AbortSignal.timeout(45000),
  });

  const durationMs = Date.now() - startTime;

  // Clone direct AI extraction before post-processing
  const directAiExtraction: IdentityExtraction = JSON.parse(JSON.stringify(object));
  const sanitizedIdentity: IdentityExtraction = JSON.parse(JSON.stringify(object));

  // Sanitize and normalize fields
  if (sanitizedIdentity.name) {
    sanitizedIdentity.name = sanitizedIdentity.name.trim();
  }

  if (sanitizedIdentity.email) {
    sanitizedIdentity.email = sanitizedIdentity.email.trim().toLowerCase();
  }

  // Format 13-digit Pakistani CNIC if numbers match
  if (sanitizedIdentity.cnic) {
    const rawDigits = sanitizedIdentity.cnic.replace(/\D/g, "");
    if (rawDigits.length === 13) {
      sanitizedIdentity.cnic = `${rawDigits.slice(0, 5)}-${rawDigits.slice(5, 12)}-${rawDigits.slice(12)}`;
    }
  }

  // Clean phone numbers
  if (sanitizedIdentity.phone) {
    sanitizedIdentity.phone = sanitizedIdentity.phone.trim();
  }

  // Deduplicate and sanitize links
  const seenAddresses = new Set<string>();
  sanitizedIdentity.links = (sanitizedIdentity.links || []).filter((l) => {
    if (!l.address || !l.address.trim()) return false;
    const cleanAddr = l.address.trim().toLowerCase();
    if (seenAddresses.has(cleanAddr)) return false;
    seenAddresses.add(cleanAddr);
    return true;
  });

  // Recover email from mailto links if email was missing
  if (!sanitizedIdentity.email) {
    const mailtoLink = sanitizedIdentity.links.find((l) =>
      l.address?.toLowerCase().startsWith("mailto:")
    );
    if (mailtoLink) {
      sanitizedIdentity.email = mailtoLink.address.replace(/^mailto:/i, "").trim().toLowerCase();
    }
  }

  // Infer canonical platform enum if address matches known domains
  for (const link of sanitizedIdentity.links) {
    if (!link.platform?.normalized && link.address) {
      const addr = link.address.toLowerCase();
      if (addr.includes("github.com")) {
        link.platform = { raw: link.platform?.raw || "GitHub", normalized: "github" };
      } else if (addr.includes("linkedin.com")) {
        link.platform = { raw: link.platform?.raw || "LinkedIn", normalized: "linkedin" };
      } else if (addr.includes("gitlab.com")) {
        link.platform = { raw: link.platform?.raw || "GitLab", normalized: "gitlab" };
      } else if (addr.includes("twitter.com") || addr.includes("x.com")) {
        link.platform = { raw: link.platform?.raw || "Twitter", normalized: "twitter" };
      }
    }
  }

  // Collect diagnostics
  const diagnostics: IdentityDiagnostic[] = [];

  if (!sanitizedIdentity.name || sanitizedIdentity.name.length < 2) {
    diagnostics.push({
      level: "error",
      code: "MISSING_NAME",
      title: "Candidate Name Not Detected",
      detail: "No reliable full name could be extracted from the candidate document header.",
    });
  }

  if (!sanitizedIdentity.email) {
    diagnostics.push({
      level: "warning",
      code: "MISSING_EMAIL",
      title: "No Contact Email Found",
      detail: "Candidate profile lacks an explicitly stated email address.",
    });
  }

  if (!sanitizedIdentity.phone) {
    diagnostics.push({
      level: "info",
      code: "MISSING_PHONE",
      title: "No Phone Number Detected",
      detail: "Candidate profile does not include a contact phone number.",
    });
  }

  // Step: Canonicalize Geographic Location & Territory
  const rawLoc = (sanitizedIdentity.location?.raw || "").trim();
  const extractedCity = sanitizedIdentity.location?.normalized?.city || null;
  const { city, province } = normalizeLocation(rawLoc, extractedCity);

  if (city || province) {
    sanitizedIdentity.location = {
      raw: sanitizedIdentity.location?.raw || null,
      normalized: { city, province },
    };
  } else {
    sanitizedIdentity.location = {
      raw: sanitizedIdentity.location?.raw || null,
      normalized: null,
    };
  }

  const isTerritory = province === "Islamabad Capital Territory";

  if (city === "Islamabad") {
    diagnostics.push({
      level: "info",
      code: "FEDERAL_TERRITORY_RESOLVED",
      title: "Federal Capital Territory Normalized",
      detail: "Resolved Islamabad as a Federal Capital Territory ('Islamabad Capital Territory') rather than a standard provincial jurisdiction.",
    });
  } else if (!city && !rawLoc) {
    diagnostics.push({
      level: "warning",
      code: "UNSPECIFIED_LOCATION",
      title: "Unspecified Location Case",
      detail: "No geographic address was detected in document. Assigned to 'Unspecified' bucket.",
    });
  } else if (!city && rawLoc) {
    diagnostics.push({
      level: "info",
      code: "UNSPECIFIED_LOCATION_BUCKET",
      title: "Unspecified Municipality Bucket",
      detail: `Stated as '${rawLoc}' without specific municipality. Assigned to 'Unspecified' bucket.`,
    });
  }

  const platformsDetected = Array.from(
    new Set(
      sanitizedIdentity.links
        .map((l) => l.platform?.normalized || l.platform?.raw)
        .filter(Boolean) as string[]
    )
  );

  return {
    durationMs,
    model: modelName,
    provider: "openai",
    directAiExtraction,
    sanitizedIdentity,
    summary: {
      hasName: Boolean(sanitizedIdentity.name),
      hasEmail: Boolean(sanitizedIdentity.email),
      hasPhone: Boolean(sanitizedIdentity.phone),
      hasCnic: Boolean(sanitizedIdentity.cnic),
      hasLocation: Boolean(city || sanitizedIdentity.location?.raw),
      city,
      province,
      isFederalTerritory: isTerritory,
      territoryLabel: isTerritory
        ? "Federal Capital Territory"
        : province
        ? `${province} Province`
        : "Unspecified Location",
      linksCount: sanitizedIdentity.links.length,
      platformsDetected,
    },
    diagnostics,
  };
}
