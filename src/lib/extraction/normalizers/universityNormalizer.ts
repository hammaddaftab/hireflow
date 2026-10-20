import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { UniversityEntry } from "../catalogs/fetchUniversities";
import universityAliases from "../catalogs/university_aliases.json";
import {
  sanitizeText,
  sanitizeTokens,
  rawSimilarityRatio,
  isLengthRatioSafe,
} from "@/lib/matching/stringSimilarity";

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
  "science",
  "the",
  "and",
  "college",
]);

// Strips campus or sub-campus clauses and parenthetical qualifiers (e.g. "(SEECS)", ", Chiniot-Faisalabad Campus")
export function stripCampusSuffix(text: string): string {
  return text
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*,\s*[^,]*campus.*$/gi, "")
    .replace(/\s+campus\b.*$/gi, "")
    .trim();
}

// Prunes stopwords and returns alphabetically sorted tokens joined by a single space
export function pruneAndSortTokens(sanitized: string): string {
  const tokens = sanitized
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
  return tokens.sort().join(" ");
}

// Calculates Levenshtein similarity ratio between 0.0 and 1.0 for pruned sorted tokens
export function tokenSortRatio(s1: string, s2: string): number {
  return rawSimilarityRatio(s1, s2);
}

// In-memory catalog state initialized once at module load
let isInitialized = false;
const aliasMap = new Map<string, UniversityEntry>();
const unitMap = new Map<string, UniversityEntry>();
const preprocessedTargets: PreprocessedTarget[] = [];

// Resolves path to static catalog file
function getCatalogPath(): string {
  return resolve(process.cwd(), "src/lib/extraction/catalogs/universities_pk.json");
}

// Loads static catalog and builds Tier 1 hash map and Tier 2 targets
export function initializeUniversityCatalog(forceReload = false): void {
  if (isInitialized && !forceReload) return;

  const catalogPath = getCatalogPath();
  if (!existsSync(catalogPath)) {
    isInitialized = true;
    return;
  }

  try {
    aliasMap.clear();
    unitMap.clear();
    preprocessedTargets.length = 0;

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

      // Index all sub-units (Rule 1: bare unit resolves directly to parent)
      if (Array.isArray(uni.units)) {
        for (const unit of uni.units) {
          const sanitizedUnit = sanitizeText(unit);
          if (sanitizedUnit) {
            aliasMap.set(sanitizedUnit, uni);
            unitMap.set(sanitizedUnit, uni);
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

    // Merge curated aliases from university_aliases.json
    for (const [id, aliases] of Object.entries(universityAliases as Record<string, string[]>)) {
      const uni = universities.find((u) => u.id === id);
      if (uni && Array.isArray(aliases)) {
        for (const alias of aliases) {
          const sanitized = sanitizeText(alias);
          if (sanitized) {
            aliasMap.set(sanitized, uni);
          }
        }
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
      const candidate = aliasMap.get(strippedCampus);
      if (candidate) {
        // Guard: ensure stripped campus match does not contradict a known sub-unit in the query
        const inputTokens = sanitizeTokens(trimmed);
        const conflictingUnit = inputTokens.some((t) => {
          const parent = unitMap.get(t);
          return parent && parent.id !== candidate.id;
        });
        if (!conflictingUnit) {
          exactMatch = candidate;
        }
      }
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

  // Rule 2: Sub-Unit Stripping with Consistency Guard
  const inputTokens = sanitizeTokens(trimmed);
  for (const token of inputTokens) {
    const unitParent = unitMap.get(token);
    if (!unitParent) continue;

    const remainingTokens = inputTokens.filter((t) => t !== token);
    if (remainingTokens.length === 0) continue;
    const remainderQuery = remainingTokens.join(" ");

    // Preserve parenthetical clauses (e.g. acronyms like (NUST)) by stripping unit from raw input
    const unitRegex = new RegExp(`\\b${token}\\b`, "gi");
    const rawRemainder = trimmed
      .replace(unitRegex, "")
      .replace(/\(\s*\)/g, "")
      .trim();

    // Check Tier 1 exact on remainder
    const sanitizedRemainder = sanitizeText(remainderQuery);
    const sanitizedRawRemainder = sanitizeText(rawRemainder);
    const strippedCampusRemainder = sanitizeText(stripCampusSuffix(rawRemainder));

    let remainderMatch =
      aliasMap.get(sanitizedRemainder) ||
      (sanitizedRawRemainder ? aliasMap.get(sanitizedRawRemainder) : undefined) ||
      (strippedCampusRemainder ? aliasMap.get(strippedCampusRemainder) : undefined);

    if (remainderMatch) {
      if (remainderMatch.id === unitParent.id) {
        return {
          institution_raw: trimmed,
          canonical_id: unitParent.id,
          canonical_name: unitParent.canonicalName,
          match_method: "EXACT_ALIAS",
          confidence: 1.0,
          is_unverified: false,
        };
      }
      // Remainder resolved to a different institution (e.g. LUMS SEECS) -> consistency failure
      return {
        institution_raw: trimmed,
        canonical_id: null,
        canonical_name: null,
        match_method: "UNRESOLVED",
        confidence: 0.0,
        is_unverified: true,
      };
    }

    // Check Tier 2 fuzzy on remainder (prefer campus-stripped query if available)
    const queryToPrune =
      strippedCampusRemainder && strippedCampusRemainder !== sanitizedRemainder
        ? strippedCampusRemainder
        : sanitizedRemainder;
    const prunedRemainder =
      pruneAndSortTokens(queryToPrune) || pruneAndSortTokens(sanitizedRemainder);
    if (prunedRemainder) {
      const remLen = prunedRemainder.length;
      let bestRemScore = 0.0;
      let bestRemMatch: UniversityEntry | null = null;

      for (const target of preprocessedTargets) {
        if (!isLengthRatioSafe(remLen, target.tokenLength, 0.6)) {
          continue;
        }
        const score = tokenSortRatio(prunedRemainder, target.prunedSortedTokens);
        if (score > bestRemScore) {
          bestRemScore = score;
          bestRemMatch = target.entry;
        }
      }

      if (bestRemMatch && bestRemScore >= 0.80) {
        if (bestRemMatch.id === unitParent.id) {
          return {
            institution_raw: trimmed,
            canonical_id: unitParent.id,
            canonical_name: unitParent.canonicalName,
            match_method: "TOKEN_SORT_FUZZY",
            confidence: Number(bestRemScore.toFixed(2)),
            is_unverified: false,
          };
        }
        // Consistency check failed -> stay unresolved
        return {
          institution_raw: trimmed,
          canonical_id: null,
          canonical_name: null,
          match_method: "UNRESOLVED",
          confidence: 0.0,
          is_unverified: true,
        };
      }
    }

    // Unit recognized but remainder failed to resolve -> stay unresolved
    return {
      institution_raw: trimmed,
      canonical_id: null,
      canonical_name: null,
      match_method: "UNRESOLVED",
      confidence: 0.0,
      is_unverified: true,
    };
  }

  // Step 2: Stopword Pruning (prefer campus/parenthesis-stripped query if available)
  const strippedCampus = sanitizeText(stripCampusSuffix(trimmed));
  const queryToPrune = strippedCampus && strippedCampus !== sanitizedInput ? strippedCampus : sanitizedInput;
  const inputPrunedSorted = pruneAndSortTokens(queryToPrune) || pruneAndSortTokens(sanitizedInput);
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
    if (!isLengthRatioSafe(inputLen, targetLen, 0.6)) {
      continue;
    }

    const score = tokenSortRatio(inputPrunedSorted, target.prunedSortedTokens);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = target.entry;
    }
  }

  // Cutoff threshold lowered to 0.80
  if (bestMatch && bestScore >= 0.80) {
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
