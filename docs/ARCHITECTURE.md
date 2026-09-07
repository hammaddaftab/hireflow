# HireFlow System Architecture

This document provides the definitive, end-to-end architectural blueprint, layer hierarchy, data pipelines, domain contracts, and engineering standards for HireFlow.

---

## 1. Executive Summary & Architectural Philosophy

Traditional AI recruitment tools typically operate as black-box scoring engines. They assign terminal numeric ranks (e.g., "87% match") or make opaque binary hiring decisions. This approach introduces a severe trust deficit: recruiters cannot verify why an AI rejected a candidate, hallucinated qualifications go unnoticed, and edge-case work histories (such as overlapping contract roles or career breaks) produce unpredictable outputs.

HireFlow takes a fundamentally different approach:
* **Descriptive, Never Terminal**: The system acts as a high-speed recruiter assistant. It highlights confirmed evidence, identifies objective gaps, and flags discrepancies, but leaves judgment and final decisions to the human recruiter.
* **Evidence-Grounded Verification**: Every claim made during evaluation is bound directly to verbatim quote citations extracted from the candidate's original document.
* **Deterministic Over Generative**: Hard constraints (tenure arithmetic, degree tier validation, notice periods, salary ceilings) are evaluated in pure TypeScript code without calling LLMs. Generative AI is reserved strictly for unstructured document parsing and nuanced natural language semantic queries.

---

## 2. End-to-End System Topology

The diagram below traces the end-to-end lifecycle of candidate data through the system, from raw resume ingress to candidate decision persistence:

```
[Candidate Documents: PDF, DOCX, TXT]
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ INGRESS & STORAGE LAYER                                                │
│  ├── Multi-part form parsing: /api/resumes/upload                      │
│  ├── Binary persistence: @vercel/blob (with local disk fallback)       │
│  ├── Document provenance: SHA-256 byte hashing & deduplication         │
│  └── Upload record registered in PostgreSQL ("resume_uploads" table)   │
└────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ SEQUENTIAL EXTRACTION ENGINE                                           │
│  ├── Client-driven queue pacing (prevents LLM rate-limit exhaustion)   │
│  ├── Text buffer extraction via pdf2json                               │
│  ├── Multi-aspect structured extraction via Vercel AI SDK              │
│  │     (OpenAI GPT-4o / GPT-5.6 or Google Gemini 2.0 / 3.5 Flash)      │
│  └── 7 Canonical Aspect Schemas:                                       │
│        identity, work_history, education, skills_demonstrated,          │
│        skills_declared, logistics, extraction_metadata                 │
└────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TWO-TIER INGRESS NORMALIZATION ENGINE                                  │
│  ├── University Normalization:                                         │
│  │     Tier 1: O(1) exact hash map lookup across 136 HEC institutions   │
│  │     Tier 2: Token-sorted Levenshtein distance fallback gate         │
│  ├── Location Normalization:                                           │
│  │     LLM-native extraction of raw address + city/province resolution │
│  └── Skill Canonicalization:                                           │
│        Domain dictionary normalization against standard aliases        │
└────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DATA LAYER & PERSISTENCE                                               │
│  ├── Authoritative Drizzle ORM schemas in PostgreSQL                   │
│  ├── Inferred TypeScript types guarantee zero schema drift             │
│  └── Tables: jobs, candidates, candidate_reviews, groups,              │
│              candidate_group_memberships, query_evaluations            │
└────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DUAL-LAYER EVALUATION PIPELINE                                         │
│                                                                        │
│  [Layer A: Pure Deterministic Evaluators (Active)]                     │
│    ├── Experience: Overlap deduplication & tenure arithmetic           │
│    ├── Education: Ranked degree tier hierarchy comparison              │
│    ├── Skills: Required vs. preferred taxonomy matching                │
│    ├── Logistics: Budget caps, work mode & notice period checks        │
│    └── Precomputes "derived" contract: dotType, pillText, badgeText    │
│                                                                        │
│  [Layer B: Semantic Query Engine (Roadmap / Schema-Ready)]             │
│    ├── Zod schema & prompt: entities/extraction/matching/queryEvaluation│
│    ├── Database persistence: query_evaluations table in PostgreSQL     │
│    └── Planned runtime: 10–20 compact profile batching with quotes     │
└────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ MULTI-MODAL PRESENTATION LAYER                                         │
│  ├── Headless Domain State Engine: useReviewData.ts                    │
│  ├── View 1: Linear Triage Queue (/review)                             │
│  │     Keyboard-driven rapid sorting into keep / flag / pass buckets   │
│  ├── View 2: Immersive 3D Focus Stage (/review/focus)                  │
│  │     3D perspective transforms, SVG circular arc track, floating dock│
│  ├── Bulk Uploads & Feedback Hub (/uploads)                            │
│  │     Batch ingestion deck, live telemetry, and interactive sandbox   │
│  └── AI Evaluation & Reliability Bench (/evals/experience)             │
│        Ground-truth fixture testing for extraction accuracy            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Layer Hierarchy & Dependency Invariants

The codebase enforces a strict downward dependency hierarchy. Code at any level may only import from layers below it or from shared utilities:

```
src/entities/         # Authoritative persistent schemas & prompt specs (0 feature imports)
      │
      ▼
src/features/         # Self-contained business slices (0 cross-feature sibling imports)
      │
      ▼
src/app/              # Next.js Server Component page routes & API handlers
```

### Layer Responsibilities

1. **`src/entities/`**:
   * Contains Drizzle ORM table definitions (`jobs`, `candidates`, `candidateReviews`, `groups`, `matching`, `resumeUploads`).
   * Houses the 7 canonical extraction aspect schemas and markdown prompt contracts in [`/src/entities/extraction/`](/src/entities/extraction/).
   * Exports inferred types (`typeof table.$inferSelect`).
   * **Strict Rule**: Exactly zero imports from `src/features/` or `src/app/`.

2. **`src/features/`**:
   * Isolated feature modules: `jobs`, `candidates`, `extraction`, `review`, `uploads`, `evals`.
   * Encapsulates domain services, headless hooks, and feature-specific UI.
   * **Strict Rule**: Sibling features never import directly from each other. If data or utilities are shared across features, they must be promoted to `src/entities/` or `src/lib/`.
   * **Single Public Facade**: Each feature exposes exactly one top-level `index.ts` declaring its public interface. Internal subdirectories do not use nested barrel files.

3. **`src/lib/`**:
   * Cross-cutting infrastructure: AI SDK provider resolution, Vercel Blob client, document hashing utilities, and error handling primitives (`ApiError`).

4. **`src/db/`**:
   * PostgreSQL singleton connection pool and database schema aggregator re-exported directly from `entities/`.

5. **`src/app/`**:
   * Next.js App Router layer (`layout.tsx`, `page.tsx`, `route.ts`).
   * Server components handle parameter resolution, initial data fetching, and delegate immediately to composed feature views.

*Formalized in [ADR 0003: Database Schema Authority via Drizzle ORM and Layered Dependencies](/docs/adr/0003-drizzle-schema-authority-and-downward-dependencies.md).*

---

## 4. Layer 1: Document Ingress, Storage & Sequential Extraction

### 4.1 Dual Ingress Channels
Candidate documents enter HireFlow through two distinct ingress pathways:
1. **Bulk Upload Hub ([`/src/features/uploads`](/src/features/uploads))**: A dedicated multi-file management interface where recruiters drop batches of resumes, view storage status, inspect document hashes, and assign files to jobs using interactive feedback decks.
2. **Contextual Quick-Drop ([`/src/components/upload/ResumeDropTrigger.tsx`](/src/components/upload/ResumeDropTrigger.tsx))**: An inline dropzone located within the review queue that automatically binds uploaded resumes directly to the active job context.

### 4.2 Storage Architecture & Local Fallback
Document binaries are stored via [`/src/lib/storage/blobStorage.ts`](/src/lib/storage/blobStorage.ts):
* **Production**: Persists binaries to **Vercel Blob Storage** using `@vercel/blob` (`put` method with public access), returning a secure CDN URL.
* **Offline / Local Fallback**: When `BLOB_READ_WRITE_TOKEN` is not provided, the storage client writes binaries to `.uploads/resumes/` on local disk and generates a deterministic `storage://resumes/{filename}` reference. The document view route ([`/src/app/api/resumes/[id]/view/route.ts`](/src/app/api/resumes/[id]/view/route.ts)) handles both transparently, streaming local files or redirecting (302) to the Vercel Blob CDN.

### 4.3 Provenance & Document Deduplication
Before extraction, [`/src/lib/upload/hashDocument.ts`](/src/lib/upload/hashDocument.ts) computes a SHA-256 byte digest of the uploaded binary. When `ENABLE_RESUME_HASHING=true` is set, matching hashes prevent duplicate uploads and avoid redundant LLM extraction invocations.

### 4.4 Sequential Extraction Pacing
Rather than issuing concurrent extraction requests across an entire batch (`Promise.all`), HireFlow executes a sequential client-driven extraction loop:
* **Rate-Limit Resilience**: Ingesting resumes sequentially prevents provider TPM (tokens per minute) and RPM (requests per minute) rate-limit spikes across OpenAI and Gemini.
* **Failure Isolation**: A parse error on document 3 of 10 does not abort the remaining 7 extractions.
* **Real-Time Telemetry**: The UI displays granular step-by-step progress (`"Extracting candidate 2 of 5..."`) with animated status indicators.

*Formalized in [ADR 0006: Resume Upload, Ingestion, and Sequential Extraction Architecture](/docs/adr/0006-resume-upload-sequential-extraction-architecture.md).*

### 4.5 The 7 Canonical Aspect Schemas
Each resume is parsed into seven strictly typed aspects defined in [`/src/entities/extraction/`](/src/entities/extraction/):
1. **`identity`**: Candidate name, normalized location (city, province, country), contact links (LinkedIn, GitHub, email, phone).
2. **`work_history`**: Chronological role entries with normalized employer, job title, start/end dates (`YYYY-MM`), employment type (`full_time`, `part_time`, `contract`, `internship`), and responsibility bullets.
3. **`education`**: Academic history with degree level (`bachelors`, `masters`, `doctorate`, `diploma`), institution name, graduation year, and field of study.
4. **`skills_demonstrated`**: Skills explicitly linked to actions, outcomes, and business impact within specific roles.
5. **`skills_declared`**: Self-reported skills listed in summary sidebars or keyword sections without contextual evidence.
6. **`logistics`**: Compensation expectation, notice period in days, work mode preferences (`remote`, `hybrid`, `onsite`), and relocation willingness.
7. **`extraction_metadata`**: Parser confidence indicators, extraction timestamps, and potential warning flags.

---

## 5. Layer 2: Two-Tier Entity & Geographic Normalization

Free-form text in resumes contains extreme variance, particularly within regional markets (such as the Pakistani tech ecosystem). HireFlow employs a double-sided normalization architecture that standardizes candidate attributes and job requirements into identical taxonomy spaces:

```
[Candidate Text: "FAST-NUCES, Lahore"]          [Job Requirement: "National University..."]
                 │                                                   │
                 ▼                                                   ▼
┌──────────────────────────────────────┐           ┌──────────────────────────────────────┐
│ Candidate Normalizer                 │           │ Job Requirement Form                 │
│  Tier 1: O(1) Hash Map               │           │  Constrained Canonical Selectors     │
│  Tier 2: Token-Sorted Levenshtein    │           │  (HEC catalog / Standard cities)     │
└──────────────────────────────────────┘           └──────────────────────────────────────┘
                 │                                                   │
                 └───────────────────┬───────────────────────────────┘
                                     │
                                     ▼
                    [Identical Taxonomy: "FAST-NUCES"]
                    [Single-Digit MS Deterministic Match]
```

### 5.1 University Normalization ([`/src/features/extraction/universityNormalizer.ts`](/src/features/extraction/universityNormalizer.ts))
* **The Problem**: Candidates refer to institutions by acronyms (`FAST`, `NUST`, `GIKI`, `UET`, `LUMS`), informal variations (`Fast National University`), or campus clauses (`FAST-NUCES Chiniot-Faisalabad Campus`). A naive exact match misses qualified candidates, while vector search creates false collisions on short acronyms.
* **The Solution**: A two-tier in-memory normalization engine running against 136 HEC-recognized Pakistani universities:
  * **Tier 1 (Exact & Acronym Match)**: $O(1)$ dictionary lookup over precomputed acronyms and common aliases.
  * **Tier 2 (Token-Sorted Levenshtein Gate)**: Strips educational stopwords (`University`, `Institute`, `College`) and campus clauses, sorts the remaining tokens alphabetically, and validates string similarity with a length-disparity safety guard.

### 5.2 Geographic & Location Normalization ([`/src/features/review/core/evaluators/locationEvaluator.ts`](/src/features/review/core/evaluators/locationEvaluator.ts))
* **The Problem**: Resumes specify granular neighborhoods (`Gulberg III`, `DHA Phase 6`, `F-7/2`), whereas job requirements specify metropolitan cities (`Lahore`, `Islamabad`) or provinces (`Punjab`).
* **The Solution**:
  * **Candidate Ingress**: Defined in [`/src/entities/extraction/candidate/aspects/identity.ts`](/src/entities/extraction/candidate/aspects/identity.ts), the LLM extracts the verbatim string into `location.raw` and leverages its native world knowledge to populate canonical `city` and `province` in `location.normalized`.
  * **Job Requirements**: Job creation forms constrain location criteria to canonical Pakistani cities and administrative territories.
  * **Hierarchical Evaluation**: The evaluator in [`/src/features/review/core/evaluators/locationEvaluator.ts`](/src/features/review/core/evaluators/locationEvaluator.ts) validates locations through a three-tier cascade: exact city match $\to$ province match $\to$ relocation willingness triage.

### 5.3 Skill Normalization ([`/src/features/extraction/skillNormalizer.ts`](/src/features/extraction/skillNormalizer.ts))
* Maps framework synonyms and common variants (`ReactJS`, `React.js`, `React Native` $\to$ `React`; `Postgres`, `PostgreSQL` $\to$ `PostgreSQL`) using curated synonym catalogs before comparison.

*Formalized in [ADR 0004: Entity and Geographic Normalization Architecture](/docs/adr/0004-entity-and-geographic-normalization-architecture.md) and [ADR 0005: Double-Sided Ingress Normalization Architecture](/docs/adr/0005-double-sided-ingress-normalization-architecture.md).*

---

## 6. Layer 3: Dual-Layer Evaluation Pipeline

### 6.1 The Token Compounding Problem & Economic Model
Passing raw resume text (800–1,500 tokens) into an LLM on every query or filter creates token compounding: evaluating 20 candidates across 3 queries uses 90,000+ input tokens with significant round-trip latency.

HireFlow decouples ingestion from evaluation:
* **One-Time Extraction**: Documents are compressed once into ~300 tokens of structured JSON aspects stored in PostgreSQL.
* **Deterministic Filtering**: 90% of qualification checks execute in memory in TypeScript in under 1 millisecond.
* **Semantic Query Packing**: When a recruiter performs an ad-hoc query (e.g. *"Find candidates with high-load distributed systems experience"*), compact JSON profiles are batched 10–20 candidates per prompt, reducing token consumption by over 75%.

*Formalized in [ADR 0001: Two-Layer Decoupled Pipeline for Resume Ingestion and Evaluation](/docs/adr/0001-two-layer-extraction-and-query-pipeline.md).*

### 6.2 Deterministic Pure Evaluators
All requirement evaluation functions in [`/src/features/review/core/evaluators/`](/src/features/review/core/evaluators/) are pure, deterministic TypeScript functions:
* **Experience Evaluator ([`experienceEvaluator.ts`](/src/features/review/core/evaluators/experienceEvaluator.ts))**: Calculates cumulative tenure across work history entries, resolves concurrency overlaps (preventing candidates with parallel jobs from artificially doubling their years of experience), and filters by employment type (distinguishing full-time roles from internships and freelance gigs).
* **Education Evaluator ([`educationEvaluator.ts`](/src/features/review/core/evaluators/educationEvaluator.ts))**: Ranks degrees hierarchically (`high_school` < `diploma` < `bachelors` < `masters` < `doctorate`) and validates institution accreditation.
* **Skills Evaluator ([`skillEvaluator.ts`](/src/features/review/core/evaluators/skillEvaluator.ts))**: Evaluates required vs preferred criteria, distinguishes demonstrated skills from declared skills, and attaches evidentiary quotes.
* **Logistics Evaluator ([`logisticsEvaluator.ts`](/src/features/review/core/evaluators/logisticsEvaluator.ts))**: Evaluates salary ceilings, maximum notice periods, and work mode compatibility.

### 6.3 Precomputed UI Contract (`derived`)
Presentational React components must never calculate business heuristics or execute defensive fallback chains (`??`) during render cycles. Every evaluator returns a pre-formatted display contract:

```typescript
export interface EvaluatedRequirementDerived {
  dotType: "confirmed" | "gap" | "contradicted" | "not_stated";
  pillText: string;   // e.g. "5/6 confirmed", "4.2 yrs exp", "FAST-NUCES"
  badgeText: string;  // e.g. "Confirmed", "Gap", "Blocking"
}
```

Components such as [`BlockingStrip.tsx`](/src/features/review/core/components/card/BlockingStrip.tsx) consume `derived` values directly, ensuring instantaneous 60 FPS UI rendering without layout thrashing.

### 6.4 Semantic Query Engine: Current Status & Roadmap
While the deterministic evaluators (Layer 3A) are fully active and drive the review queue today, the semantic natural language query engine (Layer 3B) is currently at the **data specification and schema-ready stage**:
* **Designed & Schema-Ready**: The prompt builder and Zod validation schema exist in [`/src/entities/extraction/matching/queryEvaluation.ts`](/src/entities/extraction/matching/queryEvaluation.ts) (`CandidateQueryEvaluationSchema` and `buildQueryEvaluationPrompt`), and the `query_evaluations` relational table in [`/src/entities/matching.ts`](/src/entities/matching.ts) is already migrated into the PostgreSQL database.
* **Planned Runtime Execution**: The runtime orchestration service (dispatching batched profiles to the LLM upon user input in the review search bar and streaming results to the UI) is designed as the immediate next product evolution. Today, candidate filtering in the review UI is driven entirely by deterministic qualification evaluators, job criteria matching, and status tab filtering (`keep`, `flag`, `pass`).

---

## 7. Layer 4: Data Persistence & Schema Authority

### 7.1 Single Source of Truth via Drizzle ORM
To prevent handwritten TypeScript interfaces from drifting away from PostgreSQL database schemas, Drizzle ORM acts as the sole source of truth:

```typescript
// /src/entities/job.ts
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  department: text("department"),
  status: text("status").notNull().default("active"),
  requirements: jsonb("requirements").notNull().$type<JobRequirements>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Authoritative inferred domain types
export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
```

### 7.2 Database Schema Architecture
The PostgreSQL relational schema comprises 7 interconnected tables:
1. **`jobs`**: Target position requirements, compensation ranges, required/preferred skills, and active status.
2. **`candidates`**: Structured candidate profiles, raw resume text, parsed contact info, and aspect JSON payloads.
3. **`candidate_reviews`**: Recruiter decisions (`keep`, `flag`, `pass`), review notes, and evaluation timestamps.
4. **`groups`**: Recruiter segmentation cohorts (e.g. *"Senior Backend Finalists"*, *"Shortlisted Juniors"*).
5. **`candidate_group_memberships`**: Relational join table mapping candidates into groups.
6. **`query_evaluations`**: Cached natural language query evaluation results with evidence citations.
7. **`resume_uploads`**: Binary document references, Vercel Blob URLs, filenames, and SHA-256 hashes.

*Formalized in [ADR 0003: Database Schema Authority via Drizzle ORM and Layered Dependencies](/docs/adr/0003-drizzle-schema-authority-and-downward-dependencies.md).*

---

## 8. Layer 5: Presentation Architecture & Viewport Isolation

The candidate review system supports two distinct recruiter workflows that share the same underlying domain state without tight coupling:

```
┌────────────────────────────────────────────────────────┐
│ HEADLESS DOMAIN STATE: useReviewData.ts                │
│  ├── Candidate queue state                             │
│  ├── Recruiter mutations (keep, flag, pass)            │
│  ├── Triage statistics & active filter tab             │
│  └── Zero knowledge of DOM, SVG, or view layouts       │
└────────────────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌──────────────────┐  ┌───────────────────────────────────┐
│ useQueueView.ts  │  │ useFocusCarousel.ts               │
│ (Linear Triage)  │  │ (3D Stage & Spatial Arc Math)     │
└──────────────────┘  └───────────────────────────────────┘
         │                     │
         ▼                     ▼
[/review Route]       [/review/focus Route]
(Keyboard list)       (3D carousel, circular arc track)
```

### 8.1 Headless Domain Engine ([`useReviewData.ts`](/src/features/review/core/hooks/useReviewData.ts))
Encapsulates all domain mutations, triage counters, and filter logic. It exposes pure state and action handlers (`onKeep`, `onFlag`, `onPass`, `onReset`) and remains agnostic of whether cards are rendered in a vertical list, a grid, or a 3D carousel.

### 8.2 Viewport Controllers
* **Linear Triage Queue ([`useQueueView.ts`](/src/features/review/views/queue/hooks/useQueueView.ts))**: Manages keyboard navigation hotkeys (K = keep, F = flag, P = pass, J/Down = next, K/Up = previous), active scroll indexes, and tab bucketing.
* **3D Focus Stage ([`useFocusCarousel.ts`](/src/features/review/views/focus/hooks/useFocusCarousel.ts))**: Calculates circular arc trigonometry, card rotation radians, z-index elevation stacks, and auto-rotation timers.

### 8.3 Bundle Splitting & Slot Composition
* Heavy SVG graphics, framer-motion transforms, and carousel trigonometry are code-split into `/review/focus`. Users on the high-speed linear triage route (`/review`) do not download 3D carousel assets.
* Shared components such as [`CandidateCard.tsx`](/src/features/review/core/components/card/CandidateCard.tsx) accept action slots (`headerActionSlot`, `footerActionSlot`) rather than using internal view-mode branching flags.

### 8.4 Design System & Semantic Elevation
HireFlow implements Google Material Design 3 (M3) semantic tokens via Tailwind CSS variables:
* **Surfaces**: `surface`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`.
* **Content Roles**: `on-surface` (primary typography and icons) and `on-surface-variant` (secondary and supporting text).
* **Structural Boundaries**: `outline` and `outline-variant` for subtle, high-density boundaries.

*Formalized in [ADR 0002: Decoupling Review Domain State from Multi-Modal Viewport Layouts](/docs/adr/0002-review-state-and-multi-view-isolation.md).*

---

## 9. Layer 6: Reliability Benchmarking & AI Stress Test Lab

To guarantee that LLM profile extraction remains accurate and resistant to hallucinations across complex work histories, HireFlow includes an in-application AI evaluation workbench located at [`/evals/experience`](/src/app/evals/experience/page.tsx) and managed by [`/src/features/evals/`](/src/features/evals/):

* **Ground-Truth Fixtures ([`/src/features/evals/data/defaultFixtures.ts`](/src/features/evals/data/defaultFixtures.ts))**: A curated testbed of difficult real-world resumes, including concurrent roles, freelance/contract overlaps, non-standard date formats (`Fall 2021`, `03/22`), and career gaps.
* **Accuracy Metrics**: Measures model output against ground truth for total years, full-time years, role count, and date boundary precision within configurable tolerance windows (e.g. $\pm 0.2$ years).
* **Continuous Quality Assurance**: Allows developers to benchmark new foundation models (e.g., comparing GPT-4o with Gemini 2.5 Flash) before deploying extraction updates into production.

---

## 10. Architectural Decision Records (ADRs) Index

HireFlow maintains formal Architectural Decision Records documenting critical architectural forks and technical trade-offs:

| ADR | Title | Status | Primary Technical Domain |
| :--- | :--- | :--- | :--- |
| **[ADR 0001](/docs/adr/0001-two-layer-extraction-and-query-pipeline.md)** | Two-Layer Decoupled Pipeline for Resume Ingestion and Evaluation | Accepted | Extraction Pipeline & Token Economics |
| **[ADR 0002](/docs/adr/0002-review-state-and-multi-view-isolation.md)** | Decoupling Review Domain State from Multi-Modal Viewport Layouts | Accepted | UI Architecture & Viewport Isolation |
| **[ADR 0003](/docs/adr/0003-drizzle-schema-authority-and-downward-dependencies.md)** | Database Schema Authority via Drizzle ORM and Layered Dependencies | Accepted | Data Layer & Module Hierarchy |
| **[ADR 0004](/docs/adr/0004-entity-and-geographic-normalization-architecture.md)** | Entity and Geographic Normalization Architecture | Accepted | Entity Resolution & Regional Normalization |
| **[ADR 0005](/docs/adr/0005-double-sided-ingress-normalization-architecture.md)** | Double-Sided Ingress Normalization Architecture | Accepted | Taxonomy Alignment & Ingress Gateways |
| **[ADR 0006](/docs/adr/0006-resume-upload-sequential-extraction-architecture.md)** | Resume Upload, Ingestion, and Sequential Extraction Architecture | Accepted | Binary Storage & Rate-Limit Control |

*Historical technical debt, initial prototyping trade-offs, and refactoring resolutions are documented in the [Refactoring Retrospective & Technical Debt Log](/docs/REFACTOR_RETROSPECTIVE.md).*