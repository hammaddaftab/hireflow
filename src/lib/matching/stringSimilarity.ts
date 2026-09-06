// Strips punctuation, lowercases, and normalizes whitespace
export function sanitizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Splits sanitized text into non-empty tokens
export function sanitizeTokens(text: string): string[] {
  return sanitizeText(text)
    .split(" ")
    .filter((t) => t.length > 0);
}

// Returns alphabetically sorted tokens joined by a single space
export function sortTokens(text: string): string {
  return sanitizeTokens(text).sort().join(" ");
}

// Standard dynamic-programming Levenshtein distance calculation
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

// Calculates Levenshtein similarity ratio between 0.0 and 1.0 for token-sorted strings
export function tokenSortRatio(s1: string, s2: string): number {
  const sorted1 = sortTokens(s1);
  const sorted2 = sortTokens(s2);
  const maxLen = Math.max(sorted1.length, sorted2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(sorted1, sorted2);
  return (maxLen - dist) / maxLen;
}

// Calculates raw Levenshtein similarity ratio for pre-sorted/pre-processed strings
export function rawSimilarityRatio(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return (maxLen - dist) / maxLen;
}

// Safety guard preventing collisions between short acronyms and longer strings (e.g. BUITEMS vs ITU)
export function isLengthRatioSafe(lenA: number, lenB: number, minRatio = 0.6): boolean {
  if (lenA === 0 || lenB === 0) return false;
  const min = Math.min(lenA, lenB);
  const max = Math.max(lenA, lenB);
  return min / max >= minRatio;
}
