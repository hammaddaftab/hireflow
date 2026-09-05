# ADR 0001: Two-Layer Decoupled Pipeline for Resume Ingestion and Evaluation

* **Status**: Accepted
* **Date**: 2026-09-05
* **Technical Domain**: Data Pipeline & LLM Architecture (`/src/features/extraction`, `/src/entities/extraction`)

---

## 1. Context & Problem Statement

Candidate evaluation in AI recruitment tools typically involves filtering, ranking, and querying candidate pools against specific job requirements. A naive approach feeds raw resume text (or full PDF text dumps) into LLM prompts every time a recruiter runs a search, creates a query group, or screens candidates.

In practice, this creates major operational bottlenecks:
* **Token Compounding**: An average resume contains 800 to 1,500 tokens of noisy text, headers, and formatting artifacts. Evaluating a modest pool of 20 candidates across 3 recruiter queries requires `20 * 3 * 1,500 = 90,000+` input tokens.
* **Query Latency**: Re-reading raw documents on every recruiter interaction introduces multi-second round-trip delays, making interactive triage and live filtering impractical.
* **Extraction Inconsistency**: Asking an LLM to parse resume structure and judge qualifications in the same prompt increases hallucination and yields inconsistent evaluations across different query runs.
* **Inability to Run Deterministic Filters**: Criteria such as total years of verified full-time tenure, notice period limits, or salary caps are deterministic constraints. Using LLMs to repeatedly calculate dates or compare numbers from prose is slow, expensive, and error-prone.

---

## 2. Decision Drivers

* **Minimize Query Cost and Latency**: Enable real-time recruiter search and screening without re-processing full documents.
* **Deterministic vs. Semantic Separation**: Handle hard constraints (experience tenure, degree level, compensation bounds) deterministically in code, reserving LLM calls for nuanced semantic questions.
* **Verbatim Grounding & Auditability**: Ensure any evaluation claim is backed by a verbatim quote from the candidate's history to avoid ungrounded AI inferences.
* **Predictable Data Contracts**: Provide typed, canonical data structures for downstream application features (`review`, `jobs`, `candidates`).

---

## 3. Considered Options

### Option A: Two-Layer Decoupled Pipeline (Chosen)
Separate ingestion from evaluation into two independent phases:
1. **Layer 1 (Ingestion)**: Extract raw resumes once on upload into 7 strongly-typed aspect schemas (`identity`, `work_history`, `education`, `skills_demonstrated`, `skills_declared`, `logistics`, `extraction_metadata`), compressing the candidate into ~300 tokens of structured JSON.
2. **Layer 2 (Evaluation)**: Screen candidates by evaluating deterministic criteria in pure TypeScript, and batching compact structured profiles (10–20 candidates per prompt) for semantic recruiter queries.

### Option B: Retrieval-Augmented Generation (RAG) with Vector Chunks
Split raw resumes into text chunks, compute embeddings, and retrieve top-k chunks per recruiter query.
* **Drawback**: Resumes are short documents (1–3 pages) where context is relational rather than topical. Chunking breaks temporal continuity (associating job titles with specific dates and companies) and fails completely on aggregate questions (e.g., "calculate total years of experience across all roles" or "verify notice period"). Vector retrieval is the wrong tool for structured document triage.

### Option C: Direct Ad-Hoc Evaluation on Raw Resumes
Send raw resume text directly to the model for each recruiter query or screening step.
* **Drawback**: Prohibitive token costs, multi-second latency per candidate, and unpredictable evaluation consistency.

---

## 4. Decision Outcome

**Chosen Option**: **Option A (Two-Layer Decoupled Pipeline)**.

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

---

## 5. Implementation Details

1. **Aspect Schemas as Source of Truth**:
   Canonical aspect definitions live in [`/src/entities/extraction/`](/src/entities/extraction/) as Zod schemas with companion markdown prompt specifications (e.g., [`education.ts`](/src/entities/extraction/candidate/aspects/education.ts) paired with [`education.md`](/src/entities/extraction/candidate/prompts/education.md)).
2. **Compression Ratio**:
   Raw resume payloads (~1,200 tokens) are compressed into dense JSON profiles (~300 tokens), yielding an approximate 70–75% reduction in token volume per candidate.
3. **Deterministic Fast-Path**:
   Core hard constraints are verified in code by pure evaluators (e.g., [`experienceEvaluator.ts`](/src/features/review/core/evaluators/experienceEvaluator.ts) calculating date spans), bypassing the LLM entirely during queue sorting.
4. **Batch Semantic Queries**:
   Ad-hoc queries (e.g., "Led migration of high-throughput distributed systems") pack multiple compact profiles into a single prompt via [`/src/app/api/review/query/route.ts`](/src/app/api/review/query/route.ts), returning evidentiary statuses (`confirmed`, `gap`, `contradicted`, `not_stated`) accompanied by verbatim quote spans.

---

## 6. Consequences

### Positive Consequences
* **Major Token Savings**: Screening 20 candidates across 3 queries uses ~18,000 tokens instead of 90,000+, reducing model costs by ~75%.
* **Near-Instant Triage Sorting**: Deterministic criteria (years of experience, degree, location, salary) filter in milliseconds without waiting on API calls.
* **Audit-Grounded Evidence**: Downstream UI displays literal resume quotes alongside evaluation statuses, avoiding unsupported AI claims.
* **Stable Contracts**: Application UI features interact with typed TypeScript interfaces rather than unstructured LLM text strings.

### Trade-offs & Mitigations
* **Upfront Ingestion Overhead**: Extracting all 7 aspects on upload takes 3–5 seconds per resume.
  * *Mitigation*: Uploads run asynchronously with progress indicators; once ingested, all future queries are fast.
* **Schema Evolution Costs**: Modifying an aspect schema requires either running a data migration or re-extracting stored candidate documents.
  * *Mitigation*: Aspect schemas are versioned and represent general career data independent of any specific job opening.

