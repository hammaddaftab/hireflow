import React from "react";
import {
  Github,
  Linkedin,
  Gitlab,
  Globe,
  Twitter,
  ExternalLink,
} from "lucide-react";

/**
 * Normalizes degree strings into human-readable degree titles.
 * e.g., "bachelors_degree" -> "Bachelors degree"
 */
export function formatDegreeName(deg: string | null): string {
  if (!deg) return "Degree";
  const str = deg.replace("_", " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Maps link platform names to appropriate Lucide icon components.
 */
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

/**
 * Formats start date, end date, and current status into a clean tenure string.
 * e.g., "2020 – Present" or "2018 – 2022"
 */
export function formatDateRange(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean
): string {
  const start = startDate || "N/A";
  const end = isCurrent ? "Present" : endDate || "N/A";
  return `${start} – ${end}`;
}

