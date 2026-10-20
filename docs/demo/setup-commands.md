We have created a dedicated, single command for setting up the candidates from mock data and cleaned up old redundant scripts.

Your complete workflow is now three focused commands:

---

### The 3-Step Demo Pipeline

#### Step 1: Wipe Schema and Seed Job Requirements Only
```bash
npm run db:reset:clean
```
* Drops the public schema, applies migrations, and seeds only `job-sample-1`.
* **State**: `Jobs: 1`, `Uploads: 0`, `Candidates: 0`.

---

#### Step 2: Compile Markdown Resumes and Upload in Decoupled State
```bash
npm run demo:setup-resumes:decouple
```
* Compiles `.md` resumes in [`docs/demo/resumes/`](/docs/demo/resumes/) into PDFs, uploads them to storage, and sets deterministic timestamps in `status: "stored"`.
* **State**: `Jobs: 1`, `Uploads: 3` (unparsed, `candidateId: null`), `Candidates: 0`.

---

#### Step 3: Set Up Candidates from Mock Data
```bash
npm run demo:setup-candidates
```
* **What it does** ([`scripts/setup-demo-candidates.ts`](/scripts/setup-demo-candidates.ts)):
  1. Inserts the fixed golden candidates from [`src/features/candidates/mockCandidates.ts`](/src/features/candidates/mockCandidates.ts) into PostgreSQL.
  2. Inherits the exact live Blob URLs and ordered timestamps from the matching resume uploads.
  3. Links the uploads to the candidates (`status: "extracted"`, `candidateId: cand.id`).
  4. Seeds candidate groups and memberships (`Fast-Clear`, `Immediate Interview`, etc.).
* **State**: `Jobs: 1`, `Uploads: 3`, `Candidates: 3`, `Groups: 5`, `Memberships: 7`.

---

### Summary of Commands

| Purpose | Command |
|---|---|
| Fresh DB with job only | `npm run db:reset:clean` |
| Upload raw unparsed PDFs | `npm run demo:setup-resumes:decouple` |
| Populate mock candidates & link | `npm run demo:setup-candidates` |