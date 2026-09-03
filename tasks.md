# Normalization Tasks

## Task 1: Closed-Set Normalization via Enums
- **Scope**: Small, bounded entity sets where all valid variants are known in advance (e.g., social and portfolio links in [`/src/features/extraction/candidate/aspects/identity.ts`](/src/features/extraction/candidate/aspects/identity.ts)).
- **Context**: Unstructured string arrays allow arbitrary casing and formatting from the LLM. Enforcing a schema-level enum guarantees byte-by-byte exactness (e.g., `"github"`) across all extractions.
- **Implementation**:
  - Refactor raw string links to structured objects: `{ platform: z.enum(["github", "linkedin", "gitlab", "portfolio", "other"]), url: z.string() }`.
  - Enforce the enum directly in the extraction Zod schema so the LLM output is constrained by tool/schema validation.

## Task 2: Open-Set Normalization via RAG Disambiguation
- **Scope**: Large, open-ended entity sets with hundreds of entries or variations (e.g., universities in [`/src/features/extraction/candidate/aspects/education.ts`](/src/features/extraction/candidate/aspects/education.ts)).
- **Problems Fixed**:
  1. **Context Pollution & Cost**: Injecting hundreds of institutions (e.g., 200+ HEC-recognized universities) directly into the prompt inflates token counts, increases latency, and multiplies per-resume extraction cost.
  2. **Schema Breakage**: Abnormally large enum lists degrade the LLM's adherence to the overall JSON schema and output formatting.
  3. **Out-of-Vocabulary Failures**: Candidates attending unlisted, foreign, or newly established institutions cause hard enums to fail validation or force the model to hallucinate an incorrect match.
- **Implementation**:
  - Keep the primary extraction pass literal (`institution_raw`).
  - Query a canonical institution dataset using vector or BM25 search to retrieve the result we need.