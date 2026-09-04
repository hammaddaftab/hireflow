## The Core Architectural Bet: Two-Layer Decoupled Pipeline

Most AI recruitment prototypes fall into a naive trap: every time a recruiter searches, filters, or groups applicants, the application re-sends full, raw resume text to the LLM.

* **The Problem**: A raw resume is 800–1,500 tokens of noisy formatting. Running queries directly against raw documents causes severe token compounding, multi-second latencies per candidate, and unpredictable schema drift.
* **The Solution**: We decoupled **Ingestion (Layer 1)** from **Evaluation (Layer 2)**:
  1. **Ingestion (Run Once)**: Resumes are extracted upon arrival into 7 discrete, typed aspects (`identity`, `work_history`, `education`, `skills_demonstrated`, `skills_declared`, `logistics`, `extraction_metadata`).
  2. **3–5x Payload Compression**: Resumes compress from ~1,500 raw tokens into ~300 tokens of dense, canonical JSON.
  3. **Query Time (Layer 2)**: Downstream recruiter screening and ad-hoc searches run against compact structured profiles in batches of 10–20 candidates per prompt, reducing per-candidate evaluation latency and API cost by over 70%.

```
[Raw PDF / Email Attachment]
           │
           ▼
[Layer 1: Ingestion & Extraction (Run Once)]
  ├── identity (Pakistani CNIC dedup, normalized location)
  ├── work_history (reverse chron, verified tenure months)
  ├── education (degree tier normalization)
  ├── skills_demonstrated (action-attributed vs peripheral)
  ├── skills_declared (delta comparison)
  └── logistics (salary bounds, notice period)
           │
           ▼
[Drizzle ORM / PostgreSQL + Vercel Blob Storage]
           │
           ▼
[Layer 2: Evaluation Engine]
  ├── Deterministic Queries (Experience tenure, Degree tier, Budget ceiling)
  └── Semantic Queries (Ad-hoc recruiter prompts with evidence quotes)
```

### Layer 2 Query Separation
* **Deterministic Queries**: Fast, zero-token evaluation executed deterministically in code against the structured profile (e.g., verifying 5+ years of full-time tenure from work history dates, checking bachelor's degree ranking, or confirming notice period bounds).
* **Semantic Queries**: Targeted LLM evaluation over compact batches of structured profiles to judge nuanced recruiter criteria (e.g., "Led migration of high-throughput database systems"), returning an evidentiary status and verbatim quoted justification without re-reading raw resumes.


---

## Code Style & Spacing Rules

* **No Redundant Multi-Line Comments**: Do not write explanatory JSDoc/docstring blocks for self-evident tables, components, or functions (e.g. `/** Candidate Reviews Table ... */`). Clean naming must speak for itself.
* **Vertical Rhythm & Spacing**:
  * **3 blank lines** separation between major conceptual groups in a single code file (e.g., between table definitions or top-level service blocks).
  * **1 blank line** separation when subtypes or related properties differ within a group.