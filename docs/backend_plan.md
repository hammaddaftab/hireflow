# HireFlow Backend Plan

This document outlines the architecture, data models, and step-by-step implementation for HireFlow's backend services.

---

## 1. Core Architecture

HireFlow operates on a **Two-Layer Architecture**:

1. **Layer 1: Document Ingestion & Extraction (Once per resume)**:
   - Resumes (PDFs or raw text) are parsed once into a standardized, job-agnostic JSON profile (`ParsedCandidateProfile`).
   - Parsing is executed against explicit aspect schemas (`identity`, `work_history`, `education`, `skills_demonstrated`, `skills_declared`, `logistics`, `extraction_metadata`).
   - Compresses raw resume payload (800–1,500 tokens) into compact structured data (150–400 tokens), decoupling document intake from downstream queries.

2. **Layer 2: Evaluation & Query Engine (Query-time matching)**:
   - Evaluates pre-parsed candidate profiles against job requirements (deterministic knockouts: experience years, mandatory skills, degree tier, compensation, notice period).
   - Evaluates batches of compact candidate profiles against ad-hoc recruiter natural language queries using LLM structured extraction (`queryEvaluationAspect`).
   - Produces evidence-grounded statuses (`confirmed`, `gap`, `contradicted`, `not_stated`, `ambiguous`) with literal verbatim quotes.

---

## 2. Component Breakdown

### Component 1: Modular PDF & Text Extraction Engine
- **Location**: [`/src/lib/pdf/extractText.ts`](/src/lib/pdf/extractText.ts) & [`/src/features/extraction/candidate/candidateExtractionService.ts`](/src/features/extraction/candidate/candidateExtractionService.ts)
- **Input**: `Buffer`, `Uint8Array`, or raw text (supports web uploads, local files, and future Gmail PDF attachment ingestion).
- **Core Methods**:
  - `extractTextFromPdf(input: Buffer | Uint8Array): Promise<string>`
  - `extractCandidateProfile(resumeText: string, options?: CandidateExtractionOptions): Promise<ParsedCandidateProfile>`
- **Aspect Execution**: Uses AI SDK `generateObject` with Google Gemini 2.0 Flash (`gemini-2.0-flash`) or mock fallback.

### Component 2: Ingestion Endpoint (`POST /api/candidates/upload`)
- **Location**: [`/src/app/api/candidates/upload/route.ts`](/src/app/api/candidates/upload/route.ts)
- **Supported Payloads**:
  - `multipart/form-data`: Single or multiple PDF files (`file` field).
  - `application/json`: Direct text payload `{ text: string, filename?: string, appliedJobId?: string }`.
- **Behavior**: Extracts text, parses candidate aspects, validates against `ParsedCandidateProfileSchema`, and saves candidate to storage.

### Component 3: Ad-Hoc Recruiter Query & Grouping (`POST /api/review/query`)
- **Location**: [`/src/app/api/review/query/route.ts`](/src/app/api/review/query/route.ts)
- **Input**: `{ jobId: string, queryText: string, candidateIds?: string[] }`.
- **Behavior**:
  - Packs candidate profiles in compact batch format via `buildQueryEvaluationPrompt`.
  - Evaluates batch using `generateObject` and `QueryEvaluationExtractionSchema`.
  - Returns array of `{ candidate_id, status, reasoning, evidence_span }`.

### Component 4: Review Queue & Recruiter Decisions (`/api/review/decision`)
- **Location**: [`/src/app/api/review/decision/route.ts`](/src/app/api/review/decision/route.ts)
- **Input**: `{ candidateId: string, jobId: string, decision: "passed" | "flagged" | "rejected", notes?: string }`.
- **Behavior**: Persists recruiter assessment state.

### Component 5: Job Description Parsing (`POST /api/jobs/parse-jd`)
- **Location**: [`/src/app/api/jobs/parse-jd/route.ts`](/src/app/api/jobs/parse-jd/route.ts)
- **Input**: `{ rawText: string }`.
- **Behavior**: Extracts structured criteria (`hardCriteria`, `softCriteria`, compensation, notice period) via `jobRequirementsAspect`.

---

## 3. Implementation Steps

1. **Step 1 (Current)**:
   - Create modular PDF text extraction utility (`extractTextFromPdf`).
   - Create candidate extraction runner (`candidateExtractionService.ts`) running the 7 aspects.
   - Wire `POST /api/candidates/upload` accepting PDF / text.
2. **Step 2**:
   - Implement `POST /api/review/query` for ad-hoc natural language search and dynamic candidate grouping.
3. **Step 3**:
   - Implement review decision persistence (`POST /api/review/decision`).
4. **Step 4**:
   - Implement JD auto-structuring (`POST /api/jobs/parse-jd`).
