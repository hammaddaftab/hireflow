# HireFlow Refactoring Retrospective & Technical Debt Log

This document chronicles the technical debt accumulated during initial rapid prototyping, the architectural trade-offs evaluated, and how the codebase was systematically refactored into a maintainable, decoupled system.

---

## 1. Context: Rapid Prototyping and Early Trade-offs

During initial hackathon development, velocity was prioritized to validate three core capabilities:
1. Multi-aspect resume extraction using LLMs.
2. Prompt accuracy against complex work histories.
3. Two distinct review experiences: a linear triage queue and an immersive 3D carousel.

Moving fast enabled rapid UX validation, but created predictable architectural debt:
* Handwritten TypeScript interfaces drifted from PostgreSQL/Drizzle table schemas.
* Sibling features imported directly from each other's internal folders.
* A single monolithic hook handled both candidate mutations and 3D SVG animation math.
* React components performed business heuristics and fallback chains during render loops.
* Nested barrel files caused circular dependency loops and bundler slowdowns.

Once core product flows were validated, we executed a focused refactoring sprint to transition the prototype into a production-ready codebase.

---

## 2. Technical Debt Items & Resolutions

### Debt Item 1: Schema Drift Between Database and Handwritten Types
* **The Problem**:
  `src/entities/job.ts` maintained a handwritten `interface Job` alongside the Drizzle ORM `jobs` table definition. Over time, property naming conventions drifted (snake_case vs camelCase) and timestamp formats mismatched (`string` vs `Date`). Similar drift existed in candidate and review models.
* **The Refactoring**:
  * Established Drizzle ORM table schemas as the single source of truth for persistent data.
  * Replaced handwritten interfaces with Drizzle type inference (`typeof table.$inferSelect` and `typeof table.$inferInsert`).
  * Inferred types guarantee that TypeScript types always stay in exact synchronization with the PostgreSQL database schema without manual upkeep.

---

### Debt Item 2: Sibling Feature Coupling and Unclear Data Boundaries
* **The Problem**:
  `src/features/review` was importing directly from internal files in `src/features/jobs`, `src/features/candidates`, and `src/features/extraction`. Sibling features were tightly coupled, making changes to extraction break review rendering.
* **The Refactoring**:
  * Extracted an authoritative, feature-agnostic `/src/entities/` directory at the project root for persistent models (`job.ts`, `candidate.ts`, `review.ts`, `matching.ts`) and canonical extraction aspect schemas (`entities/extraction/`).
  * Enforced a strict **downward dependency hierarchy**:
    ```
    src/entities/        // Pure persistent data schemas (0 feature imports)
          │
          ▼
    src/features/        // Isolated application slices (0 sibling feature imports)
          │
          ▼
    src/app/             // Next.js Server Component page routes
    ```
  * Promoted cross-cutting fixtures (e.g., `mockCandidates.ts`) to `src/lib/`.
  * Enforced the rule that sibling features never import from each other. Shared models live in `@/entities` or `@/lib`.

---

### Debt Item 3: Monolithic Hook Mixing Domain State with Viewport Animation
* **The Problem**:
  A single 267-line hook (`useReviewQueue`) managed both candidate mutations (`keep`, `flag`, `pass`, review statistics, query filters) and layout-specific behavior (active carousel index, SVG arc rotation radians, pulse timers, and document keydown listeners). This coupled headless business logic to visual presentation and prevented code reuse.
* **The Refactoring**:
  * Split the hook into a two-level architecture:
    1. **Headless Domain State**: [`useReviewData.ts`](/src/features/review/core/hooks/useReviewData.ts) manages the candidate queue, mutations, filter calculations, and review stats. It has zero knowledge of DOM events, active indices, or visual layouts.
    2. **Viewport Controllers**:
       * [`useQueueView.ts`](/src/features/review/views/queue/hooks/useQueueView.ts): Manages active item index, status tab filtering, and list hotkeys.
       * [`useFocusCarousel.ts`](/src/features/review/views/focus/hooks/useFocusCarousel.ts): Manages circular arc geometry, carousel pulse timers, and URL query synchronization.

---

### Debt Item 4: Business Heuristics and Fallback Chains in JSX
* **The Problem**:
  Presentational components like `BlockingStrip.tsx` contained defensive fallback chains attempting to resolve requirement status at render time:
  ```typescript
  const hasOutcome = skill.hasOutcome ?? Boolean(skill.outcome_attached);
  const isOrphan = skill.isOrphan ?? (skill.status === "ambiguous");
  ```
  This resulted in long, brittle component files where layout was mixed with business logic.
* **The Refactoring**:
  * Decoupled requirement verification into dedicated pure functions in `/src/features/review/core/evaluators/` (`evaluateExperience`, `evaluateSkills`, `evaluateEducation`, `evaluateLogistics`).
  * Standardized a precomputed output contract returned by every evaluator:
    ```typescript
    export interface EvaluatedRequirementDerived {
      dotType: EvidentiaryDotType;  // "confirmed" | "gap" | "contradicted" | "not_stated"
      pillText: string;             // Pre-formatted status label
      badgeText: string;            // Secondary status badge
    }
    ```
  * Components now simply render data directly from `derived` values with zero inline status derivation.

---

### Debt Item 5: Bundle Overhead and Cross-View Coupling
* **The Problem**:
  The `/review` triage queue and `/review/focus` 3D carousel lived in a single flat components folder. Heavy SVG arc math and 3D preview cards were bundled into the standard queue page route, increasing initial page load size for users who only needed the linear queue.
* **The Refactoring**:
  * Reorganized `/src/features/review` into a shared `core/` directory and two isolated view subdirectories: `views/queue/` and `views/focus/`.
  * Replaced internal view mode flags on shared components with slot props (`headerActionSlot`, `footerActionSlot`) on [`CandidateCard.tsx`](/src/features/review/core/components/card/CandidateCard.tsx).
  * Next.js now splits `/review` and `/review/focus` into independent client bundles. 3D carousel graphics are never loaded on the triage queue route.

---

### Debt Item 6: Barrel File Tax and Circular Dependency Loops
* **The Problem**:
  Intermediate `index.ts` files throughout subdirectories triggered circular dependency warnings in bundlers and degraded compilation speed during hot reloading.
* **The Refactoring**:
  * Enforced a **single entry point policy**: exactly one `index.ts` per feature, exporting only composed page views and public services.
  * Removed internal barrel files in favor of explicit module imports.
  * Eliminated pass-through type re-exports in favor of direct imports from `@/entities/*`.

---

## 3. Practical Architecture Summary

```
src/
├── entities/                      // Authoritative persistent domain schemas (0 feature imports)
│   ├── job.ts                     // Drizzle `jobs` table + inferred types + requirements
│   ├── candidate.ts               // Drizzle `candidates` table + ParsedCandidateProfile Zod schema
│   ├── review.ts                  // Drizzle `candidateReviews` table + ReviewDecision / QueueFilterTab
│   ├── matching.ts                // Drizzle `queryEvaluations` table + QueryEvaluationRecord
│   └── extraction/                // Aspect schemas & prompt markdown specifications
│
├── features/                      // Self-contained application slices (0 sibling feature imports)
│   ├── jobs/                      // Jobs dashboard, job creation wizard, local form state
│   ├── candidates/                // Candidate profiles and listing
│   ├── extraction/                // Runtime extraction execution services
│   └── review/                    // Review feature module
│       ├── index.ts               // Public feature facade (The ONLY index.ts in the feature)
│       ├── types.ts               // Canonical review types
│       ├── core/                  // Shared domain logic (hooks, evaluators, card atoms, utils)
│       └── views/                 // Isolated route views (queue/ and focus/)
│
├── lib/                           // Shared infrastructure & cross-cutting fixtures
└── db/                            // Database connection & schema aggregator
```

---

## 4. Key Takeaways

1. **Infer Types from the Source of Truth**: Writing manual TypeScript interfaces that mirror database tables always leads to drift. Let Drizzle or your ORM infer types automatically.
2. **Decouple Ingestion from Querying**: In LLM systems, parsing documents into structured aspects upfront reduces downstream query latency and token volume by over 70%.
3. **Keep Presentation Dumb**: If JSX contains fallback chains (`??`) to calculate business states, extract that logic into pure functions with a precomputed display contract.
4. **Separate Viewport State from Domain State**: Keep data mutations headless so different visual paradigms (lists, carousels, tables) can share the same state engine without coupling to layout math.
