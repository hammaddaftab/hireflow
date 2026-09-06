# ADR 0005: Double-Sided Ingress Normalization Architecture

* **Status**: Accepted
* **Date**: 2026-09-06
* **Technical Domain**: Data Ingress & Matching Boundaries (`/src/features/extraction`, `/src/features/jobs`, `/src/features/review/core/evaluators`)

---

## 1. Context & Problem Statement

Matching and evaluation engines frequently degrade due to the **"runtime normalization trap"**: raw, un-normalized text strings from disparate ingress vectors (unstructured resumes and recruiter requirement inputs) collide during evaluation.

In technical recruitment, entity representations diverge constantly across boundaries:
1. **Punctuation & Capitalization**: Candidates write `Node.js`, `NodeJS`, or `node`, while recruiters may input `Node.js` or `nodejs`.
2. **Acronyms vs Full Forms**: Resumes list `AWS`, `K8s`, or `GCP`, while job specifications may demand `Amazon Web Services`, `Kubernetes`, or `Google Cloud Platform`.
3. **Academic Degrees & Disciplines**: Candidates state `BSCS`, `Software Engg`, or `IT`, while job criteria specify `Computer Science` or `Information Technology`.

When normalization is deferred to evaluation time:
* **Compounding Runtime Cost**: Every evaluation query against a candidate batch must repetitively parse, sanitize, regex-replace, and fuzzy-score strings.
* **Domain Leakage**: Evaluator functions become polluted with large static dictionaries, acronym catalogs, and string cleaning utilities, violating the Single Responsibility Principle.
* **Corroboration Failures (False Orphans)**: Candidate internal cross-checks (e.g. comparing `skills_declared` against `skills_demonstrated` to detect unverified claims) produce false positive anomalies simply because a candidate listed `NodeJS` in their skills section but extracted `Node.js` from work history bullets.

---

## 2. Decision Drivers

* **Zero Evaluation-Time Overhead**: Evaluators must operate as pure scoring and status engines, assuming canonical representations and resolving matches via $O(1)$ operations on the primary path.
* **Normalize Once at Ingress**: Normalization must happen once and forever at the data ingress boundaries before persistence or downstream consumption.
* **Single Domain Authority**: Normalization logic, canonical entity catalogs, synonym dictionaries, and collision blocklists must reside exclusively in the extraction domain (`/src/features/extraction/`).
* **Symmetrical Ingress Contracts**: The Candidate Extraction Pipeline and the Job Creation Pipeline must project their textual entities into the identical canonical namespace.

---

## 3. Architecture: Double-Sided Ingress Normalization

HireFlow implements a **Double-Sided Ingress Normalization Architecture** where candidate extraction and job requirement entry independently normalize textual entities at ingress.

```
       Candidate Ingress                                Job Creation Ingress
(Resume Parsing / Extraction)                     (Recruiter Form / Job Service)
              │                                                 │
              ▼                                                 ▼
┌───────────────────────────┐                     ┌───────────────────────────┐
│ normalizeSkill(...)       │                     │ normalizeSkill(...)       │
│ normalizeFieldOfStudy(...)│                     │ normalizeFieldOfStudy(...)│
│ normalizeUniversity(...)  │                     │                           │
└─────────────┬─────────────┘                     └─────────────┬─────────────┘
              │                                                 │
              ▼                                                 ▼
┌───────────────────────────┐                     ┌───────────────────────────┐
│ Candidate Profile (DB)    │                     │ Job Requirements (DB)     │
│ • skills_demonstrated:    │                     │ • skills_required:        │
│   ["node.js", "react"]    │                     │   ["node.js", "react"]    │
│ • skills_declared:        │                     │ • education_min.field:    │
│   ["node.js", "aws"]      │                     │   "Computer Science"      │
│ • field.normalized:       │                     │                           │
│   "Computer Science"      │                     │                           │
└─────────────┬─────────────┘                     └─────────────┬─────────────┘
              │                                                 │
              └───────────────────────┬─────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Pure Evaluation Layer     │
                        │ demonstratedMap.get(skill)│  <-- O(1) Exact Match
                        │ isFieldEquivalent(...)    │  <-- Discipline Cluster
                        │ matchSkill(...) fallback  │  <-- Typo Tolerance Only
                        └───────────────────────────┘
```

---

## 4. Ingress Implementation Boundaries

### Side A: Candidate Ingress Pipeline (`/src/features/extraction/`)

Whether processed via live LLM extraction (`candidateExtractionService.ts`) or deterministic fallback (`heuristicExtraction.ts`), candidate data is normalized before the `ParsedCandidateProfile` object is created:

1. **Demonstrated Skills (`skills_demonstrated`)**:
   * Every extracted skill item passes through `normalizeSkill(item.skill)`.
   * Punctuation is stripped, lowercase canonical keys are assigned, and language-specific symbols (`C++` -> `c++`, `C#` -> `c#`, `.NET` -> `.net`) are preserved.
2. **Declared Skills (`skills_declared`)**:
   * All skills parsed from explicit resume skill lists pass through `normalizeSkill(skill)`.
   * The list is deduplicated immediately at ingress.
3. **Education Field of Study (`education.entries`)**:
   * Raw resume text or degree titles are passed through `normalizeFieldOfStudy(rawField)`.
   * Populates `entry.field.normalized` with canonical discipline names (`Computer Science`, `Software Engineering`, `Data Science`, etc.).
4. **Academic Institution (`education.entries`)**:
   * Institution names are processed through `normalizeUniversity(rawInstitution).canonical_name`, populating `entry.institution.normalized`.

### Side B: Job Creation Ingress Pipeline (`/src/features/jobs/`)

When a job requirement is created, updated, or seeded in `jobsService.ts`:

1. **Required & Preferred Skills**:
   * `skills_required` and `skills_preferred` items have their `skill` field passed through `normalizeSkill(s.skill)`.
   * Ensures recruiter display variants (`Node.js`, `NodeJS`, `Node`) collapse to the identical canonical key (`node.js`) stored in candidate profiles.
2. **Education Minimum Field**:
   * `education_min.field` is passed through `normalizeFieldOfStudy(...)` to map user selections or manual inputs to canonical discipline taxonomy.

---

## 5. Downstream Evaluation Guarantees (`/src/features/review/core/evaluators/`)

Because both sides are normalized at ingress, the evaluation layer gains significant structural and performance benefits:

1. **$O(1)$ Primary Match Path**:
   `skillEvaluator.ts` builds an in-memory hash map of candidate demonstrated skills:
   ```ts
   const demonstratedMap = new Map<string, SkillDemonstratedItem>();
   for (const s of skills_demonstrated) {
     demonstratedMap.set(s.skill, s);
   }
   ```
   Evaluating a requirement requires only `demonstratedMap.get(skillName)`. Over 95% of candidate skills hit immediately without calculating Levenshtein matrices.

2. **Zero False-Positive Orphan Claims**:
   Candidate unverified claims (`orphanSkillsList`) compare declared skills against demonstrated skills:
   ```ts
   const orphanSkillsList = skills_declared.filter((declared) => {
     if (demonstratedMap.has(declared)) return false;
     return !skills_demonstrated.some((item) => matchSkill(declared, item.skill));
   });
   ```
   Because both arrays were normalized through `normalizeSkill(...)` at ingress, `Node.js` in work history and `NodeJS` in the skills summary share the key `node.js`, avoiding false orphan flagging.

3. **Graceful Degradation Fallback**:
   The full 4-step pipeline (`matchSkill` checking collision blocklists, static acronym maps, and token-sort ratio $\ge 0.85$) is retained purely as a fallback for unanticipated recruiter typos or zero-shared-token synonyms.

---

## 6. Consequences & Architectural Impact

### Positive
* **Decoupled Responsibilities**: Evaluator files contain zero regex replacements, casing transforms, or dictionary tables.
* **Deterministic Performance**: Review queue evaluations execute in microseconds per candidate rather than milliseconds.
* **Data Integrity Across Views**: Search queries, candidate cards, group filters (`useReviewData.ts`), and evidentiary drawers all reference unified normalized entities.

### Negative / Trade-offs
* **Migration Dependency**: Legacy or pre-seeded candidate data must pass through `normalizeCandidateProfile(...)` upon loading to guarantee normalization invariants.
* **Ingress Coupling**: Any new entity type requiring normalization (e.g. certifications) must implement ingress hooks on both candidate extraction and job creation sides.
