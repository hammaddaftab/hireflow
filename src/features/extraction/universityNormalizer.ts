import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { UniversityEntry } from "./fetchUniversities";

// Normalized entity contract produced by the two-tier normalizer
export interface NormalizedInstitutionResult {
  institution_raw: string;
  canonical_id: string | null;
  canonical_name: string | null;
  match_method: "EXACT_ALIAS" | "TOKEN_SORT_FUZZY" | "UNRESOLVED";
  confidence: number;
  is_unverified: boolean;
}

interface PreprocessedTarget {
  entry: UniversityEntry;
  prunedSortedTokens: string;
  tokenLength: number;
}

// Educational stopwords stripped during Tier 2 fuzzy matching
const STOPWORDS = new Set([
  "university",
  "institute",
  "of",
  "technology",
  "sciences",
  "the",
  "and",
  "college",
]);

// Strips campus or sub-campus clauses (e.g. ", Chiniot-Faisalabad Campus")
export function stripCampusSuffix(text: string): string {
  return text
    .replace(/\s*\([^)]*campus[^)]*\)/gi, "")
    .replace(/\s*,\s*[^,]*campus.*$/gi, "")
    .replace(/\s+campus\b.*$/gi, "")
    .trim();
}

// Strips punctuation and normalizes whitespace
export function sanitizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Prunes stopwords and returns alphabetically sorted tokens joined by a single space
export function pruneAndSortTokens(sanitized: string): string {
  const tokens = sanitized
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
  return tokens.sort().join(" ");
}

// Standard Levenshtein distance calculation
export function levenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const len1 = s1.length;
  const len2 = s2.length;
  let prev = Array.from({ length: len2 + 1 }, (_, i) => i);
  let curr = new Array(len2 + 1).fill(0);

  for (let i = 1; i <= len1; i++) {
    curr[0] = i;
    const c1 = s1.charCodeAt(i - 1);
    for (let j = 1; j <= len2; j++) {
      const cost = c1 === s2.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[len2];
}

// Calculates Levenshtein similarity ratio between 0.0 and 1.0
export function tokenSortRatio(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return (maxLen - dist) / maxLen;
}

// In-memory catalog state initialized once at module load
let isInitialized = false;
const aliasMap = new Map<string, UniversityEntry>();
const preprocessedTargets: PreprocessedTarget[] = [];

// Resolves path to static catalog file
function getCatalogPath(): string {
  const primaryPath = resolve(process.cwd(), "src/data/universities_pk.json");
  if (existsSync(primaryPath)) return primaryPath;
  const secondaryPath = resolve(__dirname, "data/universities_pk.json");
  if (existsSync(secondaryPath)) return secondaryPath;
  return primaryPath;
}

// Loads static catalog and builds Tier 1 hash map and Tier 2 targets
export function initializeUniversityCatalog(): void {
  if (isInitialized) return;

  const catalogPath = getCatalogPath();
  if (!existsSync(catalogPath)) {
    isInitialized = true;
    return;
  }

  try {
    const raw = readFileSync(catalogPath, "utf-8");
    const universities = JSON.parse(raw) as UniversityEntry[];

    for (const uni of universities) {
      // Index full canonical name
      const sanitizedCanonical = sanitizeText(uni.canonicalName);
      if (sanitizedCanonical) {
        aliasMap.set(sanitizedCanonical, uni);
      }

      // Index canonical name without city suffix (e.g. "Information Technology University")
      if (uni.canonicalName.includes(",")) {
        const withoutCity = sanitizeText(uni.canonicalName.split(",")[0]);
        if (withoutCity && !aliasMap.has(withoutCity)) {
          aliasMap.set(withoutCity, uni);
        }
      }

      // Index ID
      const sanitizedId = sanitizeText(uni.id);
      if (sanitizedId) {
        aliasMap.set(sanitizedId, uni);
      }

      // Index all aliases
      if (Array.isArray(uni.aliases)) {
        for (const alias of uni.aliases) {
          const sanitizedAlias = sanitizeText(alias);
          if (sanitizedAlias) {
            aliasMap.set(sanitizedAlias, uni);
          }
        }
      }

      // Pre-compute Tier 2 token-sorted string
      const prunedSorted = pruneAndSortTokens(sanitizedCanonical);
      if (prunedSorted.length > 0) {
        preprocessedTargets.push({
          entry: uni,
          prunedSortedTokens: prunedSorted,
          tokenLength: prunedSorted.length,
        });
      }
    }
  } catch {
    // Graceful fallback if file read fails
  }

  isInitialized = true;
}

// Executes two-tier resolution on a raw institution string
export function normalizeUniversity(rawInput: string): NormalizedInstitutionResult {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      institution_raw: rawInput || "",
      canonical_id: null,
      canonical_name: null,
      match_method: "UNRESOLVED",
      confidence: 0.0,
      is_unverified: true,
    };
  }

  initializeUniversityCatalog();

  const trimmed = rawInput.trim();
  const sanitizedInput = sanitizeText(trimmed);

  if (!sanitizedInput) {
    return {
      institution_raw: trimmed,
      canonical_id: null,
      canonical_name: null,
      match_method: "UNRESOLVED",
      confidence: 0.0,
      is_unverified: true,
    };
  }

  // Tier 1: Exact Hash Map Lookup (direct string)
  let exactMatch = aliasMap.get(sanitizedInput);

  // Tier 1 Fallback: Exact match after stripping campus suffix
  if (!exactMatch) {
    const strippedCampus = sanitizeText(stripCampusSuffix(trimmed));
    if (strippedCampus && strippedCampus !== sanitizedInput) {
      exactMatch = aliasMap.get(strippedCampus);
    }
  }

  if (exactMatch) {
    return {
      institution_raw: trimmed,
      canonical_id: exactMatch.id,
      canonical_name: exactMatch.canonicalName,
      match_method: "EXACT_ALIAS",
      confidence: 1.0,
      is_unverified: false,
    };
  }

  // Step 2: Stopword Pruning
  const inputPrunedSorted = pruneAndSortTokens(sanitizedInput);
  if (!inputPrunedSorted) {
    return {
      institution_raw: trimmed,
      canonical_id: null,
      canonical_name: null,
      match_method: "UNRESOLVED",
      confidence: 0.0,
      is_unverified: true,
    };
  }

  const inputLen = inputPrunedSorted.length;
  let bestMatch: UniversityEntry | null = null;
  let bestScore = 0.0;

  // Tier 2: Token Sort Calculation with Length Disparity Guard
  for (const target of preprocessedTargets) {
    const targetLen = target.tokenLength;

    // Step 3: Length Disparity Guard (prevents ITU/BUITEMS collision)
    if (inputLen < 0.6 * targetLen || targetLen < 0.6 * inputLen) {
      continue;
    }

    const score = tokenSortRatio(inputPrunedSorted, target.prunedSortedTokens);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = target.entry;
    }
  }

  // Cutoff threshold at 0.85
  if (bestMatch && bestScore >= 0.85) {
    return {
      institution_raw: trimmed,
      canonical_id: bestMatch.id,
      canonical_name: bestMatch.canonicalName,
      match_method: "TOKEN_SORT_FUZZY",
      confidence: Number(bestScore.toFixed(2)),
      is_unverified: false,
    };
  }

  return {
    institution_raw: trimmed,
    canonical_id: null,
    canonical_name: null,
    match_method: "UNRESOLVED",
    confidence: 0.0,
    is_unverified: true,
  };
}
