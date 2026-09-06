# Plan Step 1: Evaluation & Matching Engine Architecture

* **Scope**: Pure Evaluation Logic, String Similarity, and Evaluator Bug Fixes
* **Target Directory**: `src/lib/matching/`, `src/features/review/core/evaluators/`, `src/features/extraction/`
* **Zero UI Coupling**: Completely isolated from frontend React components; establishes frozen data contracts.

---

## 1. Overview & Strategy

The matching and evaluation layer consists of pure TypeScript functions that evaluate parsed candidate aspects against job requirements. To avoid re-opening files or rewriting code during UI development, all evaluator logic and shared string similarity algorithms are finalized first.

---

## 2. Issues & Exact Implementation Plan

### Issue 1: Shared Deterministic String Similarity Engine
* **File to Create**: `src/lib/matching/stringSimilarity.ts`
* **File to Modify**: `src/features/extraction/universityNormalizer.ts`
* **Problem**: Token-sort Levenshtein matching is currently embedded inside `universityNormalizer.ts`. Skills and academic fields of study need the exact same similarity algorithm. Creating bespoke algorithms for each entity creates code duplication and divergence.
* **How to Achieve It**:
  1. Create `src/lib/matching/stringSimilarity.ts` exporting:
     * `sanitizeTokens(text: string): string[]`: Cleans punctuation, lowercases, and splits tokens.
     * `levenshteinDistance(a: string, b: string): number`: Standard dynamic-programming edit distance.
     * `tokenSortRatio(strA: string, strB: string): number`: Sorts tokens alphabetically and computes Levenshtein ratio:
       $$\text{ratio} = 1 - \frac{\text{distance}}{\max(\text{lenA}, \text{lenB})}$$
     * `isLengthRatioSafe(lenA: number, lenB: number, minRatio = 0.6): boolean`: Safety guard preventing acronym subset collisions (e.g. `BUITEMS` colliding with `ITU`).
  2. Refactor `src/features/extraction/universityNormalizer.ts`:
     * Import `tokenSortRatio`, `levenshteinDistance`, and `isLengthRatioSafe` from `@/lib/matching/stringSimilarity`.
     * Remove duplicated Levenshtein matrix calculations from `universityNormalizer.ts` while preserving the existing university alias cache, stopword pruning, and campus suffix stripping.

---

### Issue 2: Fix Work Mode Local Candidate Blindspot
* **Files to Modify**:
  * `src/features/review/core/evaluators/workModeEvaluator.ts`
  * `src/features/review/core/evaluators/logisticsEvaluator.ts`
* **Problem**: When a role requires `onsite` or `hybrid` presence in Lahore, a candidate already living in Lahore does not state relocation willingness on their CV (since no relocation is needed). Currently, `workModeEvaluator.ts` checks only `stated_relocation_willingness`; since it is `not_stated`, the candidate is marked as `ambiguous` instead of `confirmed`.
* **How to Achieve It**:
  1. In `workModeEvaluator.ts`:
     * Update `WorkModeEvaluatorInput` to accept:
       ```typescript
       location_requirement: LocationRequirement | null;
       normalized_location: NormalizedLocation | null;
       ```
     * When `mode === "onsite"` or `mode === "hybrid"`:
       * Extract `reqCity = location_requirement?.city?.toLowerCase()`.
       * Extract `reqProvince = location_requirement?.province?.toLowerCase()`.
       * Extract `candCity = normalized_location?.normalized?.city?.toLowerCase()`.
       * Extract `candProvince = normalized_location?.normalized?.province?.toLowerCase()`.
       * **Local Match Check**: If `reqCity && candCity && reqCity === candCity` (or if only province is set and `reqProvince === candProvince`):
         * `status = "confirmed"`
         * `reasoning = `Role requires ${mode} presence. Candidate is already located in ${candCity || candProvince}.``
       * **Non-Local Fallback**: If the candidate is located elsewhere, only then evaluate `stated_relocation_willingness`:
         * `willing` $\to$ `status = "confirmed"`, `reasoning = `Role requires ${mode} presence in ${reqCity}. Candidate based in ${candCity}, but willing to relocate.``
         * `unwilling` $\to$ `status = "contradicted"`, `reasoning = `Role requires ${mode} presence in ${reqCity}. Candidate based in ${candCity} and unwilling to relocate.``
         * `not_stated` $\to$ `status = "ambiguous"`, `reasoning = `Role requires ${mode} presence in ${reqCity}. Candidate based in ${candCity}; relocation willingness is not stated.``
  2. In `logisticsEvaluator.ts`:
     * Pass `location_requirement: input.location_requirement` and `normalized_location: input.normalized_location` into `evaluateWorkMode(...)`.

---

### Issue 3: Incomplete Currency Conversion Cleanup
* **File to Modify**: `src/features/review/core/evaluators/compensationEvaluator.ts`
* **Problem**: `compensationEvaluator.ts` only converts `USD` to `PKR` using a hardcoded `278` exchange rate. The frontend previously offered `EUR` and `GBP`, which defaulted to rate `1`, treating £4,000 as 4,000 PKR.
* **How to Achieve It**:
  1. Clean up supported currency pairs: strictly support `PKR` and `USD`.
  2. Maintain `const rate = curr === "USD" && band.currency === "PKR" ? 278 : 1;`.
  3. Ensure that if candidate currency matches job currency, rate is `1`. If candidate stated `USD` for a `PKR` job, scale by `278`.

---

### Issue 4: Field of Study Fuzzy Matching & Discipline Equivalence
* **File to Modify**: `src/features/review/core/evaluators/educationEvaluator.ts`
* **Problem**: `education_requirement.field` (e.g. `"Computer Science"`) was completely ignored in `educationEvaluator.ts`. A candidate with a degree in Fine Arts was confirmed as long as their degree tier was `bachelors`. Furthermore, strict equality would reject `"BSCS"`, `"Software Engg"`, or `"Data Science"` for a `"Computer Science"` job.
* **How to Achieve It**:
  1. **Canonical Field Synonym Dictionary**:
     * Map common Pakistani abbreviations and acronyms to canonical names:
       * `bscs`, `bs-cs`, `cs`, `computing` $\to$ `"Computer Science"`
       * `bsse`, `se`, `software engg` $\to$ `"Software Engineering"`
       * `bsit`, `it`, `information tech` $\to$ `"Information Technology"`
       * `bsds`, `ds`, `data analytics` $\to$ `"Data Science"`
       * `bsee`, `ee`, `electrical engg` $\to$ `"Electrical Engineering"`
       * `mis`, `cis` $\to$ `"Management Information Systems"`
  2. **Discipline Equivalence Clusters**:
     ```typescript
     const FIELD_EQUIVALENCE_CLUSTERS: Record<string, Set<string>> = {
       "Computer Science": new Set([
         "Computer Science",
         "Software Engineering",
         "Computer Engineering",
         "Information Technology",
         "Data Science",
         "Artificial Intelligence",
       ]),
       "Software Engineering": new Set([
         "Software Engineering",
         "Computer Science",
         "Computer Engineering",
       ]),
     };
     ```
  3. **Evaluation Logic**:
     * Extract `reqField = education_requirement?.field`.
     * If `reqField` is present:
       * Normalize candidate fields across completed degrees using `normalizeFieldOfStudy` and shared `tokenSortRatio`.
       * Check if candidate degree field matches directly or belongs to the discipline equivalence cluster.
       * If degree tier is satisfied but field is contradicted:
         * If `blocking: true` $\to$ `status = "contradicted"`, `reasoning = `Degree tier met (${degree}), but field (${candField}) contradicts required ${reqField}.``
         * If `blocking: false` $\to$ `status = "ambiguous"`, `reasoning = `Degree tier met (${degree}), but field (${candField}) does not match preferred ${reqField}.``

---

### Issue 5: Deterministic 4-Step Skill Matching Pipeline
* **File to Modify**: `src/features/review/core/evaluators/skillEvaluator.ts`
* **Problem**: `demonstratedMap.get(skillName.toLowerCase())` is an exact-match-only lookup. Minor punctuation or spacing differences (`Node.js` vs `NodeJS`, `PostgreSQL` vs `Postgres`) trigger false negatives.
* **How to Achieve It**:
  1. **Step 1: Punctuation & Case Normalization**:
     * Clean strings by lowercasing and removing punctuation: `"Node.js"` $\to$ `"nodejs"`, `"React.js"` $\to$ `"reactjs"`, `"Next.js"` $\to$ `"nextjs"`.
  2. **Step 2: Explicit Collision Blocklist**:
     * Immediate reject for dangerous false-positive collisions where fuzzy score would otherwise match:
       * `java` $\neq$ `javascript`
       * `c` $\neq$ `c++` $\neq$ `c#`
  3. **Step 3: Static Acronym / Synonym Lookup Table (~30 entries)**:
     * Map zero-shared-token equivalents:
       * `aws` $\leftrightarrow$ `amazon web services`
       * `k8s` $\leftrightarrow$ `kubernetes`
       * `gcp` $\leftrightarrow$ `google cloud platform`
       * `postgres` $\leftrightarrow$ `postgresql`
       * `mongo` $\leftrightarrow$ `mongodb`
  4. **Step 4: Shared Token-Sort Ratio Gate**:
     * Run `tokenSortRatio(reqNorm, candNorm)` using the shared engine.
     * Threshold: $\ge 0.85$ confidence.
  5. **Step 5: Fallback**:
     * If no match found $\to$ evaluate evidence as missing (`gap` or `contradicted` if mandatory).

---

## 3. Order of Execution for Step 1

1. Create `src/lib/matching/stringSimilarity.ts` with token-sort ratio and Levenshtein distance.
2. Refactor `src/features/extraction/universityNormalizer.ts` to consume the shared engine.
3. Update `src/features/review/core/evaluators/workModeEvaluator.ts` and `logisticsEvaluator.ts` for local candidate resolution.
4. Update `src/features/review/core/evaluators/compensationEvaluator.ts` for currency restrictions.
5. Update `src/features/review/core/evaluators/educationEvaluator.ts` for Field of Study matching & equivalence.
6. Update `src/features/review/core/evaluators/skillEvaluator.ts` with the 4-step deterministic pipeline.
