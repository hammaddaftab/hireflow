# ADR 0004: Entity and Geographic Normalization Architecture

* **Status**: Accepted
* **Date**: 2026-09-06
* **Technical Domain**: Data Pipeline & Entity Resolution (`/src/features/extraction`, `/src/features/review/core/evaluators`)

---

## 1. Context & Problem Statement

Candidate resumes and job descriptions in the Pakistani tech market exhibit extreme variance in non-enum textual fields, primarily:
1. **Academic Institutions**: Candidates refer to the same university using acronyms (`FAST`, `NUST`, `GIKI`, `UET`, `NED`, `LUMS`, `IBA`, `COMSATS`, `PIEAS`, `KU`), informal naming (`Fast National University`, `NUST SEECS`), or campus clauses (`FAST-NUCES, Chiniot-Faisalabad Campus`, `COMSATS University Islamabad, Lahore Campus`).
2. **Geographic Locations**: Candidates list granular neighborhoods, postal sectors, or airport codes (`Gulberg III, Lahore`, `DHA Phase 6, Karachi`, `F-7/2, Islamabad`, `LHR`, `KHI`), while job requirements specify city or province boundaries (`Lahore`, `Punjab`, `Islamabad Capital Territory`).

A naive exact-string match between candidate data and job requirements causes massive false-negative rates in candidate evaluation (e.g. rejecting a `FAST-NUCES` graduate when the query filters for `National University of Computer and Emerging Sciences`). Conversely, using runtime LLMs or vector databases for entity resolution introduces compounding token costs, latency, and hallucination on short acronyms.

---

## 2. Decision Drivers

* **Zero Runtime Cost & Low Latency**: Entity resolution must execute in-memory in single-digit milliseconds without introducing recurring model token costs.
* **Deterministic Acronym & Entity Accuracy**: Acronyms must resolve strictly to their recognized institution without false-positive subset collisions (e.g. ensuring `BUITEMS` does not collide with `ITU`).
* **Leverage Native LLM World Knowledge Where Appropriate**: Utilize the model's native geographic knowledge for unstructured address parsing, avoiding sprawling, brittle local neighborhood gazetteers.
* **Closed-Loop Matching Contract**: Ensure job requirements side and candidate extraction side share identical canonical taxonomy boundaries.

---

## 3. Considered Options

### For University Entity Normalization:

#### Option 1A: Two-Tier In-Memory Hash + Token-Sort Gate (Chosen)
A hybrid deterministic architecture running against a static catalog of 136 HEC-recognized Pakistani universities:
* **Tier 1**: Exact $O(1)$ hash map lookup over pre-computed canonical names, known spelling variations, and curated acronyms.
* **Tier 2**: Token-sorted Levenshtein distance gate with campus clause stripping, educational stopword pruning, and a length disparity safety guard.

#### Option 1B: Vector RAG / Embedding Search
Generate vector embeddings for all university names and perform cosine similarity search on candidate text.
* **Drawback**: High false-positive rate on short acronyms (`NUST` vs `FAST`), embedding model latency on ingestion, and operational overhead of maintaining a vector index for a small, finite catalog.

#### Option 1C: Runtime LLM Disambiguation
Call an LLM during extraction to resolve each university to a canonical HEC name.
* **Drawback**: Adds 500–1,000ms latency per resume, consumes extra tokens, and risks non-deterministic schema deviations or hallucinated institutions.

---

### For Geographic & Location Normalization:

#### Option 2A: Prompt-Native Extraction + Constrained Requirements (Chosen)
A dual-boundary approach:
* **Candidate Extraction**: Instruct the LLM during candidate ingestion to extract the verbatim string in `location.raw` and resolve canonical `city` and `province` independently into `location.normalized` using its native world knowledge.
* **Job Requirements (Frontend)**: Constrain city and province selection on the job creation side via standardized dropdown options for canonical Pakistani cities and administrative territories.
* **Multi-Tier Evaluator**: Evaluate locations hierarchically (City match $\to$ Province fallback match $\to$ Relocation willingness triage).

#### Option 2B: Local Geographic Gazetteer & Parsing Engine
Build a comprehensive in-code gazetteer of Pakistani sectors, neighborhoods, tehsils, and postal codes with custom regex parsers.
* **Drawback**: Extremely brittle and high maintenance; infinite variations in local naming conventions (`DHA Phase 5`, `Gulberg`, `Cantt`, `Model Town`, `Scheme 33`) make maintaining a custom geographical dictionary impractical when foundation models already possess native geographic knowledge.

---

## 4. Decision Outcome

**Chosen Decisions**:
1. **University Normalization**: **Option 1A (Two-Tier In-Memory Hash + Token-Sort Gate)**.
2. **Location Normalization**: **Option 2A (Prompt-Native Extraction + Constrained Requirements + Multi-Tier Evaluator)**.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           CANDIDATE INGESTION LAYER                            │
└────────────────────────────────────────────────────────────────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
   [Education Institution]                                [Candidate Location]
             │                                                     │
             ▼                                                     ▼
 [Two-Tier Normalizer]                                   [Prompt-Native Ingestion]
   ├── Tier 1: O(1) Hash Map                               ├── location.raw: Verbatim string
   │     (Canonical + Pre-seeded Acronyms)                 └── location.normalized:
   │                                                             ├── city: Canonical City
   └── Tier 2: Token-Sort Gate (Levenshtein >= 0.85)             └── province: Canonical Province
         ├── Strip campus suffixes (", Lahore Campus")
         ├── Prune stopwords ("university", "of", "sciences")
         └── Length disparity guard (min_len / max_len >= 0.6)
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                         MATCHING & EVALUATION LAYER                            │
└────────────────────────────────────────────────────────────────────────────────┘
                                        ▲
                                        │
                           [Job Location Requirement]
                             ├── city: Canonical Select ("Lahore" | "Any")
                             └── province: Canonical Select ("Punjab" | "Any")
                                        │
                                        ▼
                           [Multi-Tier Location Evaluator]
                             ├── 1. City Match (Confirmed)
                             ├── 2. Province Match Fallback (Confirmed)
                             └── 3. Relocation Willingness Triage (Willing / Unwilling / Ambiguous)
```

---

## 5. Implementation Details

### 1. Canonical University Store & Alias Preservation
* Canonical catalog is maintained at [`/src/data/universities_pk.json`](/src/data/universities_pk.json), sourcing 136 HEC-recognized institutions seeded with curated acronym aliases (`/src/features/extraction/data/university_aliases.json`).
* Ingestion synchronization utility [`/src/features/extraction/entityCatalog.ts`](/src/features/extraction/entityCatalog.ts) and fetch script [`/src/features/extraction/fetchUniversities.ts`](/src/features/extraction/fetchUniversities.ts) enforce an **alias preservation contract**: re-fetching or syncing the canonical dataset never overwrites or purges manually curated acronym mappings.

### 2. Two-Tier In-Memory Normalizer (`universityNormalizer.ts`)
* **Startup Initialization**: Builds an in-memory alias hash map ($O(1)$ lookup) and pre-computes token-sorted targets once at module startup.
* **Campus Suffix Stripping**: Strips regex clauses matching `,\s*[^,]*campus.*$`, `\s*\([^)]*campus[^)]*\)`, and `\s+campus\b.*$`.
* **Stopword Pruning**: Filters common institutional tokens (`university`, `institute`, `of`, `technology`, `sciences`, `the`, `and`, `college`).
* **Length Disparity Safety Guard**: If `Math.min(lenA, lenB) / Math.max(lenA, lenB) < 0.6`, Tier 2 fuzzy matching aborts immediately to prevent subset acronym collisions (e.g. `BUITEMS` colliding with `ITU`).
* **Levenshtein Threshold**: Requires $\ge 0.85$ token-sort ratio for confirmed fuzzy resolution; otherwise marks the entity as `is_unverified: true`.

### 3. Prompt-Native Location Extraction (`identity.ts`)
* Candidate identity prompt instructs the model to extract verbatim location in `raw` and structure canonical entities in `normalized`:
  * `city`: Canonical city name (e.g. `Lahore`, `Karachi`, `Islamabad`, `Rawalpindi`, `Peshawar`, `Faisalabad`, `Quetta`) resolved from neighborhoods or addresses.
  * `province`: Canonical province or territory (e.g. `Punjab`, `Sindh`, `Khyber Pakhtunkhwa`, `Balochistan`, `Islamabad Capital Territory`).

### 4. Constrained Job Creation & Multi-Tier Location Evaluation
* Frontend requirement forms ([`requirementsData.ts`](/src/features/jobs/NewJob/components/ScreeningCriteria/requirementsData.ts)) constrain `locationCity` and `locationProvince` to canonical options matching the extraction vocabulary.
* Evaluator ([`locationEvaluator.ts`](/src/features/review/core/evaluators/locationEvaluator.ts)) evaluates both dimensions:
  1. If `reqCity` is present, tests `candCity.toLowerCase() === reqCity.toLowerCase()`.
  2. If `reqCity` is null/unspecified and `reqProvince` is present, tests `candProvince.toLowerCase() === reqProvince.toLowerCase()`.
  3. If candidate location differs from requirements, evaluates `stated_relocation_willingness` (`willing` $\to$ `confirmed`, `unwilling` $\to$ `contradicted`, `not_stated` $\to$ `ambiguous`).

---

## 6. Consequences

### Positive Consequences
* **Deterministic High-Precision Normalization**: Top Pakistani universities resolve with zero false positives on acronyms and robust tolerance for campus suffix variations.
* **Sub-Millisecond Execution**: University resolution runs entirely in memory ($O(1)$ or small bounded token-sort comparison), adding virtually zero latency to the ingestion pipeline.
* **Clean Separation of Concerns**: AI handles language comprehension and geographic world knowledge during extraction; deterministic TypeScript handles entity normalization and rule-based evaluation.
* **Aligned Taxonomy**: Candidate extraction and job requirement criteria use identical canonical vocabulary for cities and provinces, eliminating string mismatch dropouts.

### Trade-offs & Mitigations
* **Unrecognized Institutions**: Unlisted private colleges or international universities will not match the HEC dataset.
  * *Mitigation*: The normalizer preserves `raw` untouched, returns `canonical_name: null`, and flags `is_unverified: true` for audit visibility without dropping the record.
* **Provincial Boundary Resolution**: Rare edge-case postal codes may result in the LLM leaving `province` as null.
  * *Mitigation*: The multi-tier evaluator falls back to city matching or relocation willingness triage.
