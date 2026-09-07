# ADR 0006: Resume Upload, Ingestion, and Sequential Extraction Architecture

* **Status**: Accepted
* **Date**: 2026-09-07
* **Technical Domain**: Data Ingress, Blob Storage, & Queue Integration (`/src/features/uploads`, `/src/components/upload`, `/src/app/api/resumes`)

---

## 1. Context & Feature Description

Candidate documents enter HireFlow either through the bulk `/uploads` hub (for multi-file assignment with feedback decks) or via fast-drop directly in `/review` (auto-scoped to the active job).

Handling document uploads and subsequent LLM candidate extraction introduces two key architectural requirements:
* **Decoupled Binary Storage**: Raw document files (`.pdf`, `.docx`, `.txt`) must be stored durably without bloating the PostgreSQL database with binary payloads.
* **LLM Rate-Limit and Token Control**: Ingesting multiple resumes concurrently triggers multi-aspect profile extraction across 7 schemas. Firing extraction requests in parallel risks saturating Gemini API rate limits and token quotas.

---

## 2. Decision Drivers

* **Rate-Limit Resilience**: Prevent Gemini LLM quota exhaustions during multi-file uploads.
* **Granular Progress Telemetry**: Expose deterministic step-by-step progress (`Extracting profile 1 of N...`) for transparent real-time feedback.
* **Guaranteed Job Scoping**: Ensure candidate extraction and evaluations are strictly bound to the target `jobId`.
* **Storage Portability**: Support Vercel Blob cloud storage with automatic local filesystem fallbacks for offline and local development.

---

## 3. Considered Options

### Option A: Fully Parallel Batch Extraction
Upload all files and trigger `Promise.all` across `/api/resumes/ingest` concurrently.
* **Drawback**: High risk of hitting LLM rate limits and token quotas on batches of 5+ resumes, with unpredictable failure handling.

### Option B: Asynchronous Background Worker Queue
Offload extraction to a Redis/BullMQ background queue.
* **Drawback**: Unnecessary operational overhead and infrastructure complexity for immediate, interactive triage needs.

### Option C: Two-Stage Storage with Sequential Client Extraction (Chosen)
Upload files to blob storage first, then sequentially invoke LLM extraction per document in a controlled client loop.

---

## 4. Decision Outcome

**Chosen Option**: **Option C (Two-Stage Storage with Sequential Client Extraction)**.

```
[Candidate Documents: PDF, DOCX, TXT]
                    │
                    ▼
[Step 1: Storage Layer - POST /api/resumes/upload]
  ├── Store binary in Vercel Blob (or .uploads fallback)
  └── Persist record in PostgreSQL "uploads" table
                    │
                    ▼
[Step 2: Sequential Client Loop - POST /api/resumes/ingest]
  ├── Document 1: Extract 7 aspects -> Persist Candidate -> Scoped to jobId
  ├── Live UI telemetry: "Extracting profile 1 of N..."
  ├── Document 2: Extract 7 aspects -> Persist Candidate -> Scoped to jobId
  └── Failure Isolation: Individual failure does not abort remaining batch
                    │
                    ▼
[Candidate Queue Injection]
  ├── buildReviewQueue([candidate], currentJob)
  └── setQueue(prev => [...prev, ...evaluatedItems])
```

---

## 5. Implementation Details

### 5.1 Storage Layer (`/src/app/api/resumes/upload/route.ts`)
- Accepts `multipart/form-data` with files and optional `jobId`.
- Saves documents to Vercel Blob using `@vercel/blob` (`put`) or falls back to local disk storage (`.uploads/resumes/`).
- Registers records in PostgreSQL via `uploadsService.addBatch()`.

### 5.2 Extraction Layer (`/src/app/api/resumes/ingest/route.ts`)
- Accepts `{ uploadId: string, jobId: string }`.
- Verifies target job and upload record in PostgreSQL.
- Parses PDF document text (`extractTextFromPdf`) and runs multi-aspect Gemini extraction (`extractCandidateProfile`), strictly scoped to `appliedJobId: jobId`.
- Persists candidate profile in PostgreSQL and updates the upload record's `jobId`.

### 5.3 Sequential Execution (`/src/components/upload/hooks/useResumeDropUpload.ts`)
```ts
// 1. Upload to storage with active jobId
const response = await fetch("/api/resumes/upload", { method: "POST", body: formData });
const { uploads } = (await response.json()).data;

// 2. Sequentially extract each document
for (let i = 0; i < uploads.length; i++) {
  setStatusLabel(`Extracting profile ${i + 1} of ${uploads.length}...`);
  const ingestRes = await fetch("/api/resumes/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId: uploads[i].id, jobId }),
  });
  const { candidate } = (await ingestRes.json()).data;
  onCandidateIngested?.(candidate);
}
```

---

## 6. Consequences

### Positive Consequences
* **Deterministic Rate Control**: Eliminates LLM rate-limit and concurrency spikes.
* **Fault Isolation**: Corrupted or unparseable files fail independently without terminating the rest of the batch.
* **Strict Job Scope Guarantee**: `jobId` is bound at both storage and ingestion stages.
* **Predictable Progress**: Provides linear, real-time UI status updates during multi-file processing.

### Trade-offs & Mitigations
* **Batch Duration**: Sequential processing scales linearly (~3–4 seconds per document).
  * *Mitigation*: The trigger displays live progress and streams newly evaluated cards directly into the review queue as each completes.
