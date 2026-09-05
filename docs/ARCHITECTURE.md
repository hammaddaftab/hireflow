# HireFlow System Architecture

This document provides the high-level system blueprint, layer hierarchy, architectural decisions, and development standards for HireFlow.

---

## 1. Core Architectural Bet: Two-Layer Decoupled Pipeline

Most AI recruitment prototypes pass raw resume text into the LLM on every search, filter, or comparison query. A raw resume contains 800–1,500 tokens of unstructured text, causing three primary issues:
1. **Severe Token Compounding**: Re-evaluating 20 candidates across 3 queries uses 90,000+ input tokens.
2. **Query Latency**: Multi-second LLM roundtrips block interactive triage and fast filtering.
3. **Inconsistent Extraction**: LLMs tasked with parsing layout and judging qualifications at the same time suffer from increased hallucination.

HireFlow decouples **Ingestion (Layer 1)** from **Evaluation (Layer 2)**:

```
[Raw PDF / Resume Document]
           │
           ▼
[Layer 1: Ingestion & Extraction (Executed Once on Upload)]
  ├── identity (Name, normalized location, contact)
  ├── work_history (Reverse-chronological roles, tenure, responsibilities)
  ├── education (Degree tier, institution, graduation year)
  ├── skills_demonstrated (Action-attributed skills linked to specific outcomes)
  ├── skills_declared (Self-reported skills listed in summary/sidebar)
  ├── logistics (Salary expectation, notice period, work mode)
  └── extraction_metadata (Confidence indicators, parse timestamps)
           │
           ▼
[Canonical Structured Profile (~300 tokens JSON) stored in PostgreSQL]
           │
           ├───────────────────────────────┐
           ▼                               ▼
[Layer 2A: Deterministic Evaluation]   [Layer 2B: Semantic Query Engine]
  ├── Verified tenure calculation        ├── Batch 10-20 compact profiles per prompt
  ├── Degree rank threshold check        ├── Structured LLM evaluation against ad-hoc query
  └── Budget ceiling / Notice period     └── Returns status + verbatim quote justification
```

* **Ingestion (Run Once)**: Uploaded resumes are extracted into 7 typed aspects (`identity`, `work_history`, `education`, `skills_demonstrated`, `skills_declared`, `logistics`, `extraction_metadata`), compressing ~1,500 tokens of raw text into ~300 tokens of dense JSON.
* **Deterministic Evaluation**: Hard constraints (years of experience, degree level, compensation ceiling, notice period) evaluate instantaneously in code via pure TypeScript functions without making API calls.
* **Semantic Evaluation**: Recruiter queries pack compact profiles in batches of 10–20 candidates per prompt, cutting query token volume by ~75% while grounding claims with verbatim quote justifications.

*Formalized in [ADR 0001: Two-Layer Decoupled Pipeline for Resume Ingestion and Evaluation](/docs/adr/0001-two-layer-extraction-and-query-pipeline.md).*

---

## 2. Global Layer Hierarchy & Dependency Flow

Data and dependencies flow strictly downward across three primary application layers:

```
src/entities/        # Authoritative persistent schemas & prompt specs (0 feature imports)
      │
      ▼
src/features/        # Self-contained application slices (0 cross-feature sibling imports)
      │
      ▼
src/app/             # Next.js Server Component page routes & API route handlers
```

### Layer Responsibilities
1. **`src/entities/`**:
   * Authoritative data layer holding Drizzle ORM `pgTable` definitions, inferred types (`typeof table.$inferSelect`), Zod aspect schemas, and companion prompt markdown specifications.
   * Strictly zero imports from `src/features/` or `src/app/`.
2. **`src/features/`**:
   * Domain-specific business logic, execution services, headless hooks, and UI views.
   * Features are completely decoupled: **features never import from sibling features**.
   * If data or utilities are shared across multiple features, they reside in `@/entities` or `@/lib`.
3. **`src/lib/`**:
   * Cross-cutting infrastructure: AI SDK provider configuration, PDF parsing utilities, Redux store setup, and shared mock datasets.
4. **`src/db/`**:
   * PostgreSQL connection pool and schema aggregator re-exported directly from `entities/`.
5. **`src/app/`**:
   * Thin Next.js Server Component routes responsible for data fetching, parameter parsing, and rendering composed feature pages.

*Formalized in [ADR 0003: Database Schema Authority via Drizzle ORM and Layered Dependencies](/docs/adr/0003-drizzle-schema-authority-and-downward-dependencies.md).*

---

## 3. Review Feature Architecture & View Isolation

The candidate review system supports two different user experiences:
1. **Linear Triage Queue (`/review`)**: A fast, keyboard-driven list for sorting candidates into keep/flag/pass buckets.
2. **Focus Carousel (`/review/focus`)**: An immersive, full-screen stage with 3D card perspectives, SVG circular track navigation, and a floating command dock.

To support both views without code duplication or tight coupling:
* **Headless Domain State**: [`useReviewData.ts`](/src/features/review/core/hooks/useReviewData.ts) manages the candidate queue, mutations (`keep`, `flag`, `pass`), review statistics, and query filter groupings. It has no awareness of DOM events, active indices, or visual layouts.
* **Viewport Controllers**:
  * [`useQueueView.ts`](/src/features/review/views/queue/hooks/useQueueView.ts): Manages active item index, tab selection, and list hotkeys.
  * [`useFocusCarousel.ts`](/src/features/review/views/focus/hooks/useFocusCarousel.ts): Manages circular arc geometry, carousel pulse timers, and URL query synchronization.
* **Slot-Based Card Composition**: Shared components like [`CandidateCard.tsx`](/src/features/review/core/components/card/CandidateCard.tsx) accept action slots (`headerActionSlot`, `footerActionSlot`) rather than using internal `if (mode === "focus")` conditional branching.
* **Bundle Splitting**: Heavy SVG geometry and carousel graphics load only on `/review/focus`, keeping the linear triage queue bundle lean.

*Formalized in [ADR 0002: Decoupling Review Domain State from Multi-Modal Viewport Layouts](/docs/adr/0002-review-state-and-multi-view-isolation.md).*

---

## 4. Code Organization & Component Standards

### 4.1 Precomputed UI Contracts (`derived`)
Presentational components must not perform business calculations or execute defensive fallback chains (`??`) during rendering.

* **Pure Evaluators**: Requirement verification lives in pure functions in `/src/features/review/core/evaluators/` (`evaluateExperience`, `evaluateSkills`, `evaluateEducation`, `evaluateLogistics`).
* **Standard Derived Contract**: Each evaluator precomputes and returns display-ready values:
  ```typescript
  export interface EvaluatedRequirementDerived {
    dotType: EvidentiaryDotType;  // "confirmed" | "gap" | "contradicted" | "not_stated"
    pillText: string;             // Display label (e.g. "5/6 confirmed", "4+ yrs exp")
    badgeText: string;            // Secondary status badge (e.g. "Confirmed", "Gap")
  }
  ```
* **Declarative Components**: Components like [`BlockingStrip.tsx`](/src/features/review/core/components/card/BlockingStrip.tsx) render data directly from `derived` values with zero inline status derivation.

### 4.2 Module Boundaries & Barrel File Discipline
* **One Public Facade per Feature**: Exactly one `index.ts` exists per feature directory, exposing only composed page containers, public services, and canonical domain types to Next.js routes.
* **No Internal Barrel Files**: Subdirectories (`core/evaluators/`, `core/components/card/`, `views/queue/`) do not contain intermediate `index.ts` files. Modules within a feature import peer files directly. This eliminates circular dependencies during builds and improves bundler tree-shaking.
* **No Pass-Through Re-exports**: Feature type files do not re-export entity types or third-party primitives. Consumers import entity types directly from `@/entities/*`.

### 4.3 Design System Tokens
Surfaces, borders, and contrast follow Material Design 3 (M3) semantic tokens via Tailwind CSS variables:
* **Surfaces**: `surface`, `surface-container-lowest` through `highest`.
* **Content**: `on-surface` (primary text/icons) and `on-surface-variant` (secondary/muted text).
* **Borders**: `outline` and `outline-variant`.

---

## 5. Architectural Decision Records

Major architectural forks and data contracts are documented in:

* **[ADR 0001: Two-Layer Decoupled Pipeline for Resume Ingestion and Evaluation](/docs/adr/0001-two-layer-extraction-and-query-pipeline.md)**
* **[ADR 0002: Decoupling Review Domain State from Multi-Modal Viewport Layouts](/docs/adr/0002-review-state-and-multi-view-isolation.md)**
* **[ADR 0003: Database Schema Authority via Drizzle ORM and Layered Dependencies](/docs/adr/0003-drizzle-schema-authority-and-downward-dependencies.md)**
* **[Refactoring Retrospective & Technical Debt Log](/docs/REFACTOR_RETROSPECTIVE.md)**