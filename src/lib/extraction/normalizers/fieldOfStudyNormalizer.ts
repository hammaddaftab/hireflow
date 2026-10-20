import { sanitizeText, tokenSortRatio } from "@/lib/matching/stringSimilarity";

// Canonical field synonym mapping for common Pakistani and international abbreviations
export const FIELD_SYNONYMS: Record<string, string> = {
  // Computer Science & Software
  bscs: "Computer Science",
  "bs cs": "Computer Science",
  cs: "Computer Science",
  computing: "Computer Science",
  "computer science": "Computer Science",
  bsse: "Software Engineering",
  "bs se": "Software Engineering",
  se: "Software Engineering",
  "software engg": "Software Engineering",
  "software engineering": "Software Engineering",

  // Information Technology & Systems
  bsit: "Information Technology",
  "bs it": "Information Technology",
  it: "Information Technology",
  "information tech": "Information Technology",
  "information technology": "Information Technology",
  mis: "Management Information Systems",
  cis: "Management Information Systems",
  "management information systems": "Management Information Systems",
  "computer information systems": "Management Information Systems",

  // Data & AI
  bsds: "Data Science",
  "bs ds": "Data Science",
  ds: "Data Science",
  "data science": "Data Science",
  "data analytics": "Data Science",
  ai: "Artificial Intelligence",
  "artificial intelligence": "Artificial Intelligence",

  // Engineering disciplines
  bsee: "Electrical Engineering",
  "bs ee": "Electrical Engineering",
  ee: "Electrical Engineering",
  "electrical engg": "Electrical Engineering",
  "electrical engineering": "Electrical Engineering",
  ce: "Computer Engineering",
  "computer engg": "Computer Engineering",
  "computer engineering": "Computer Engineering",
  "mechanical engineering": "Mechanical Engineering",
  "civil engineering": "Civil Engineering",

  // Business & Finance
  bba: "Business Administration",
  mba: "Business Administration",
  "business administration": "Business Administration",
  accounting: "Accounting & Finance",
  finance: "Accounting & Finance",
  "accounting and finance": "Accounting & Finance",
  "accounting & finance": "Accounting & Finance",
};

// Curated closed set of canonical fields of study for job requirements
export const CANONICAL_FIELDS_OF_STUDY: string[] = [
  "Any",
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Data Science",
  "Artificial Intelligence",
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Accounting & Finance",
];

// Discipline equivalence clusters for related fields of study
export const FIELD_EQUIVALENCE_CLUSTERS: Record<string, string[]> = {
  "Computer Science": [
    "Computer Science",
    "Software Engineering",
    "Computer Engineering",
    "Information Technology",
    "Data Science",
    "Artificial Intelligence",
  ],
  "Software Engineering": [
    "Software Engineering",
    "Computer Science",
    "Computer Engineering",
    "Information Technology",
  ],
  "Information Technology": [
    "Information Technology",
    "Computer Science",
    "Software Engineering",
  ],
  "Data Science": [
    "Data Science",
    "Computer Science",
    "Artificial Intelligence",
  ],
  "Electrical Engineering": [
    "Electrical Engineering",
    "Computer Engineering",
  ],
};

// Normalizes field of study string to canonical name using synonym map and token sort ratio
export function normalizeFieldOfStudy(field: string | null | undefined): string | null {
  if (!field) return null;
  const cleaned = sanitizeText(field);
  if (!cleaned) return null;

  // Direct lookup in synonym dictionary
  if (FIELD_SYNONYMS[cleaned]) {
    return FIELD_SYNONYMS[cleaned];
  }

  // Lookup without internal spaces (e.g. "bscs")
  const noSpaces = cleaned.replace(/\s+/g, "");
  if (FIELD_SYNONYMS[noSpaces]) {
    return FIELD_SYNONYMS[noSpaces];
  }

  // Fuzzy matching against known canonical names
  const canonicalNames = Array.from(new Set(Object.values(FIELD_SYNONYMS)));
  for (const canonical of canonicalNames) {
    if (tokenSortRatio(cleaned, canonical) >= 0.85) {
      return canonical;
    }
  }

  return field.trim();
}

// Helper for case-insensitive cluster retrieval
function getCluster(canonical: string): string[] | undefined {
  const target = canonical.toLowerCase();
  for (const [key, cluster] of Object.entries(FIELD_EQUIVALENCE_CLUSTERS)) {
    if (key.toLowerCase() === target) {
      return cluster;
    }
  }
  return undefined;
}

// Checks if candidate field matches or is equivalent to required field
export function isFieldEquivalent(
  reqField: string | null | undefined,
  candField: string | null | undefined
): boolean {
  const normReq = normalizeFieldOfStudy(reqField);
  const normCand = normalizeFieldOfStudy(candField);

  if (!normReq || !normCand) return false;

  // Direct canonical match
  if (normReq.toLowerCase() === normCand.toLowerCase()) {
    return true;
  }

  // Fuzzy similarity ratio match
  if (tokenSortRatio(normReq, normCand) >= 0.85) {
    return true;
  }

  // Discipline cluster equivalence check (bidirectional)
  const reqCluster = getCluster(normReq);
  if (reqCluster && reqCluster.some((c) => c.toLowerCase() === normCand.toLowerCase())) {
    return true;
  }

  const candCluster = getCluster(normCand);
  if (candCluster && candCluster.some((c) => c.toLowerCase() === normReq.toLowerCase())) {
    return true;
  }

  return false;
}

// Alias for isFieldEquivalent exposing explicit matching contract
export const matchFieldOfStudy = isFieldEquivalent;
