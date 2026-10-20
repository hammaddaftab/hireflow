import React from "react";
import {
  Github,
  Linkedin,
  Gitlab,
  Globe,
  Twitter,
  ExternalLink,
} from "lucide-react";

// 1:1 mapping of canonical degree tier enums to human-readable titles
export const CANONICAL_DEGREE_LABELS: Record<string, string> = {
  bachelors: "Bachelor's",
  masters: "Master's",
  doctorate: "Doctorate",
  diploma: "Diploma",
  high_school: "High School",
};

// Formats a canonical degree tier enum into human-readable title
export function formatDegreeTier(deg: string | null | undefined): string {
  if (!deg) return "Degree";
  const normalized = deg.trim().toLowerCase();
  if (CANONICAL_DEGREE_LABELS[normalized]) {
    return CANONICAL_DEGREE_LABELS[normalized];
  }
  return deg
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Backward-compatible alias
export const formatDegreeName = formatDegreeTier;

// Formats an education entry into a human-readable title combining canonical tier and field
export function formatEducationTitle(entry?: {
  degree_level?: { raw?: string | null; normalized?: string | null };
  field?: { raw?: string | null; normalized?: string | null };
} | null): string {
  if (!entry) return "Education";

  const tier = entry.degree_level?.normalized;
  const tierLabel = tier && CANONICAL_DEGREE_LABELS[tier.toLowerCase()]
    ? CANONICAL_DEGREE_LABELS[tier.toLowerCase()]
    : null;

  const field = entry.field?.normalized?.trim() || entry.field?.raw?.trim() || null;

  if (tierLabel && field) {
    return `${tierLabel} in ${field}`;
  }
  if (tierLabel) {
    return tier === "high_school" || tier === "diploma" ? tierLabel : `${tierLabel} Degree`;
  }
  if (field) {
    return `Degree in ${field}`;
  }

  return entry.degree_level?.raw?.trim() || "Degree";
}

// Resolves institution display name, prioritizing normalized canonical university over raw text
export function formatInstitutionName(inst?: {
  raw?: string | null;
  normalized?: string | null;
} | null): string | null {
  if (!inst) return null;
  return inst.normalized?.trim() || inst.raw?.trim() || null;
}

// Maps link platform names to appropriate Lucide icon components.
export function getPlatformIcon(platform: string | null): React.ReactNode {
  switch (platform?.toLowerCase()) {
    case "github":
      return <Github className="h-3.5 w-3.5" />;
    case "linkedin":
      return <Linkedin className="h-3.5 w-3.5" />;
    case "gitlab":
      return <Gitlab className="h-3.5 w-3.5" />;
    case "portfolio":
      return <Globe className="h-3.5 w-3.5" />;
    case "twitter":
      return <Twitter className="h-3.5 w-3.5" />;
    case "other":
    default:
      return <ExternalLink className="h-3.5 w-3.5" />;
  }
}

// Formats start date, end date, and current status into a clean tenure string.
// e.g., "2020 – Present" or "2018 – 2022"
export function formatDateRange(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean
): string {
  const start = startDate || "N/A";
  const end = isCurrent ? "Present" : endDate || "N/A";
  return `${start} – ${end}`;
}

