import { tokenSortRatio, isLengthRatioSafe } from "@/lib/matching/stringSimilarity";

// Explicit collision blocklist to prevent false positive matches between distinct technologies
export const COLLISION_PAIRS: [string, string][] = [
  ["java", "javascript"],
  ["java", "js"],
  ["c", "cpp"],
  ["c", "csharp"],
  ["cpp", "csharp"],
  ["typescript", "javascript"],
  ["sql", "nosql"],
  ["r", "rust"],
];

export function isBlockedCollision(normA: string, normB: string): boolean {
  for (const [x, y] of COLLISION_PAIRS) {
    if ((normA === x && normB === y) || (normA === y && normB === x)) {
      return true;
    }
  }
  return false;
}

// Canonical static synonym and acronym dictionary (~35 entries)
export const SKILL_SYNONYMS: Record<string, string> = {
  // Cloud & Infrastructure
  aws: "amazon web services",
  "amazon web services": "amazon web services",
  gcp: "google cloud platform",
  "google cloud": "google cloud platform",
  "google cloud platform": "google cloud platform",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  docker: "docker",
  ci: "continuous integration",
  cd: "continuous delivery",
  cicd: "ci cd",
  "ci cd": "ci cd",

  // Databases & Storage
  postgres: "postgresql",
  postgresql: "postgresql",
  mongo: "mongodb",
  mongodb: "mongodb",
  mssql: "microsoft sql server",
  "ms sql": "microsoft sql server",
  "sql server": "microsoft sql server",

  // Languages & Runtimes
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  py: "python",
  python: "python",
  rb: "ruby",
  ruby: "ruby",
  golang: "go",
  go: "go",
  cpp: "c++",
  csharp: "c#",
  dotnet: ".net",
  nodejs: "node.js",
  node: "node.js",

  // Frameworks & Libraries
  react: "react",
  reactjs: "react",
  next: "next.js",
  nextjs: "next.js",
  vue: "vue",
  vuejs: "vue",
  angular: "angular",
  angularjs: "angular",
  tf: "tensorflow",
  tensorflow: "tensorflow",
  torch: "pytorch",
  pytorch: "pytorch",
  rest: "rest api",
  "rest api": "rest api",
  restful: "rest api",
  gql: "graphql",
  graphql: "graphql",
};

// Normalizes skill name string and handles language-specific symbol syntax
export function preprocessSkill(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s === "c++" || s === "cpp") return "cpp";
  if (s === "c#" || s === "csharp") return "csharp";
  if (s === ".net" || s === "dotnet") return "dotnet";
  if (s === "c") return "c";

  return s
    .replace(/node\.js/g, "nodejs")
    .replace(/react\.js/g, "react")
    .replace(/vue\.js/g, "vue")
    .replace(/next\.js/g, "nextjs")
    .replace(/nest\.js/g, "nestjs")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Normalizes a skill string at extraction time: lowercases, strips punctuation, collapses variants & synonyms
export function normalizeSkill(raw: string): string {
  if (!raw) return "";
  const prep = preprocessSkill(raw);
  return SKILL_SYNONYMS[prep] || prep;
}

// Deterministic 4-step skill matching pipeline
export function matchSkill(skillA: string, skillB: string): boolean {
  if (!skillA || !skillB) return false;

  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);

  // Step 1: Direct normalized match
  if (normA === normB) return true;

  // Step 2: Collision blocklist guard
  if (isBlockedCollision(normA, normB)) return false;

  // Step 3: Token-sort ratio similarity with length disparity guard
  if (!isLengthRatioSafe(normA.length, normB.length, 0.6)) {
    return false;
  }

  return tokenSortRatio(normA, normB) >= 0.85;
}
