# ADR 0003: Database Schema Authority via Drizzle ORM and Layered Dependencies

* **Status**: Accepted
* **Date**: 2026-09-05
* **Technical Domain**: Data Modeling & Architecture (`/src/entities`, `/src/db`)

---

## 1. Context & Problem Statement

During early development, database tables and data schemas were defined ad-hoc inside `src/features/extraction/`. As downstream features (`src/features/review`, `src/features/jobs`, `src/features/candidates`) were built, each required access to candidate profiles and job requirements.

This introduced several maintenance and data integrity problems:
1. **Schema Drift Between DB and Types**: Drizzle ORM database tables (`jobs`, `candidates`, `candidateReviews`) were defined in one place, while separate handwritten TypeScript interfaces were maintained elsewhere. Over time, property names drifted (e.g., snake_case vs camelCase, string timestamps vs JavaScript `Date` objects).
2. **Cross-Feature Coupling**: Features like `review` and `jobs` depended directly on internal files within `features/extraction`. A change in an extraction aspect threatened to break candidate triage rendering or job creation forms.
3. **Mixing Ephemeral Form State with Persistent Models**: Transient form input types (`CreateJobInput`, wizard step state) were co-located with persistent database record models.
4. **Upward Dependency Inversion**: Data schema files were importing mock candidate datasets from UI feature directories (`@/features/candidates`).

---

## 2. Decision Drivers

* **Single Source of Truth**: Eliminate handwritten TypeScript interfaces that duplicate and drift from authoritative Drizzle ORM database schemas.
* **Feature Decoupling**: Allow application features (`jobs`, `candidates`, `review`, `extraction`) to evolve independently without importing from sibling feature folders.
* **Strict Layer Hierarchy**: Ensure data models never import from application UI features.
* **Separation of Concerns**: Keep persistent database schemas clearly separated from transient form states.

---

## 3. Considered Options

### Option A: Centralized Entities with Inferred Drizzle Types (Chosen)
Create an authoritative, feature-agnostic `/src/entities/` directory at the project root. Infer domain types directly from Drizzle table definitions using `$inferSelect` and `$inferInsert`. Enforce a strict downward dependency flow (`entities` -> `features` -> `app`).

### Option B: Keep Models Inside Features with Barrel Re-exports
Keep database schemas inside their initiating feature (e.g., `features/jobs/schema.ts`) and re-export them from the feature index for sibling features to consume.
* **Drawback**: Creates tight coupling between features, encourages circular dependencies, and obscures where the authoritative data contract lives.

### Option C: Handwritten Type Defs in a Shared `types/` Folder
Maintain standalone TypeScript interfaces in a shared directory and manually sync them with Drizzle ORM schema definitions.
* **Drawback**: Prone to silent schema drift whenever a database column is added, renamed, or modified.

---

## 4. Decision Outcome

**Chosen Option**: **Option A (Centralized Entities with Inferred Drizzle Types)**.

### 4.1 Layer Dependency Hierarchy

Data and types flow in one direction only:

```
src/entities/        // Persistent database schemas & Zod aspect specs (0 feature imports)
      │
      ▼
src/features/        // Self-contained application slices (0 sibling feature imports)
      │
      ▼
src/app/             // Next.js Server Component page routes & API endpoints
```

### 4.2 Inferred Types as the Single Source of Truth

Rather than maintaining parallel TypeScript interfaces, types for persistent records are inferred directly from Drizzle ORM table schemas:

```typescript
// src/entities/job.ts
import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // ...
});

// Authoritative inferred types:
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
```

### 4.3 Boundary Rules

1. **Entities Contain Zero UI**: `src/entities/` contains only Drizzle `pgTable` definitions, Zod validation schemas, and prompt specifications (`.md`). It contains no React components, hooks, or runtime UI logic.
2. **Ephemeral State Stays in Features**: Form inputs (`CreateJobInput`, `UpdateJobInput`), step wizard states, and local UI state remain private to `src/features/<feature>/types.ts`.
3. **Database Tables Live at Entity Root**:
   * `src/entities/job.ts`: `jobs` table + requirement criteria types.
   * `src/entities/candidate.ts`: `candidates` table + `ParsedCandidateProfileSchema`.
   * `src/entities/review.ts`: `candidateReviews` table + `ReviewDecision` & `QueueFilterTab`.
   * `src/entities/matching.ts`: `queryEvaluations` table.
4. **Cross-Cutting Data in `src/lib/`**: Shared fixtures and mock datasets (e.g., `mockCandidates.ts`) live in `src/lib/` rather than inside any single feature directory.

---

## 5. Consequences

### Positive Consequences
* **Guaranteed Type Accuracy**: Inferred types automatically reflect database schema updates, eliminating type drift across the application.
* **Decoupled Features**: Features (`review`, `jobs`, `candidates`) import pure schemas without pulling in extraction runtime code or sibling UI dependencies.
* **Predictable Dependency Graph**: Downward-only dependencies prevent circular import cycles during builds and hot reloading.

### Trade-offs & Mitigations
* **Discipline Required**: Developers must place transient form types inside their respective feature folder rather than adding them to `entities/`.

