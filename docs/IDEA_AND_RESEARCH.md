# Hireflow: Product Thesis, System Context & Research Directions

## Executive Summary (Read This First)
Hireflow is a resume screening assistant built for independent recruiters, boutique agencies, and SMBs in Pakistan who source candidates off-platform (WhatsApp, LinkedIn, email referrals) and cannot justify enterprise ATS subscriptions or job-board lock-in. Instead of collapsing a resume into a black-box 0–100 match score, Hireflow parses each uploaded CV once via an LLM into a 7-aspect structured profile and evaluates custom job requirements deterministically in code. Recruiters see every requirement tagged with an epistemic status (`confirmed`, `inferred`, `ambiguous`, `contradicted`, `not_stated`) backed by verbatim resume quotes, alongside instant pool distribution brackets (experience, salary, city, university). Because extraction happens once at ingestion, all subsequent deterministic filtering, requirement toggling, and bracket exploration cost zero tokens. The team's primary next research frontier is solving the **"Top Candidates" emergent-signal problem**: achieving $\ge 90\%$ agreement with full-context pairwise LLM ranking (capturing unstated comparative signals like employer pedigree, career velocity, and system scale) without paying to put full CVs back into context on every query.

---

## 1. Market Problem & Product Positioning

### 1.1 The Market Constraint in Pakistan
1. **Off-Platform Sourcing Reality**: Independent recruiters and SMBs in Pakistan collect 50 to 500 resumes per role across fragmented channels—WhatsApp messages, direct emails, LinkedIn exports, and personal referrals.
2. **Why Local Incumbents (Rozee.pk) Miss This Segment**: Rozee and RozeeGPT only screen candidates who apply inside Rozee's closed job-board database. A recruiter holding 200 PDFs from WhatsApp and LinkedIn has zero access to Rozee's screening tools without forcing candidates to re-apply through a paid Rozee job slot.
3. **Why Enterprise ATS Tools Fail Here**: Platforms like Eightfold, X0PA, or rigid HRIS suites (e.g., PayPeople) assume recurring hiring volume, company-wide database migration, fixed intake schemas, and monthly per-seat retainers. Intermittent and independent recruiters refuse upfront availability fees and onboarding friction.

### 1.2 Why Pay-on-Compute and Zero Lock-In
- **Pay for resources, not availability**: Charging strictly for compute consumed (resumes ingested and optional AI queries run) means a recruiter hiring three times a year pays nothing between searches, while every product feature remains unlocked without subscription tiers.
- **Bring-your-own-resumes**: Any batch of resumes can be dropped directly into a job workspace, parsed once, and screened immediately with zero organizational setup.

### 1.3 Why Per-Requirement Evidence Instead of a Single Score
- **The Problem with Single Scores**: A weighted sum $S(c) = \sum w_i f_i(c)$ is designed for sorting thousands of applicants on a centralized job board. For a recruiter screening 100–300 candidates, a score of `74%` hides whether the candidate lacked a core technical skill, asked for 50k PKR over budget, or simply forgot to list their notice period. Because recruiters cannot trust what the score hid, they end up reading every PDF manually anyway.
- **Hireflow's Approach**: The system never assigns a terminal accept/reject verdict. It outputs a descriptive evidentiary grid per requirement (`confirmed`, `inferred`, `ambiguous`, `contradicted`, `not_stated`) paired with the literal quote from the resume, leaving final judgment with the recruiter.
- **What This Trade-Off Gives Up**:
  - **No automatic 1-to-N ranking**: Without a composite score, candidates inside the same tier are ordered chronologically rather than by relative strength.
  - **Cannot natively weight unstated comparative signals**: Pure requirement checking treats all candidates who satisfy the minimum bar as equal, even if one worked at Microsoft and another worked at an unknown local shop (see Section 5 on the **Top Candidates** research problem).

---

## 2. How the System Works (Context Transfer)

### 2.1 End-to-End Architecture
```text
[Resume Upload] -> [One-Time LLM Extraction] -> [Canonical Normalization] -> [PostgreSQL JSONB]
                                                                                     |
[Recruiter UI]  <- [Evidence Tags + Brackets] <- [Deterministic Evaluators] <--------+
```

1. **Ingestion (`Parse-Once`)**: When a resume is uploaded ([`ingestResume.ts`](/src/lib/upload/server/ingestResume.ts)), text and embedded document hyperlinks are extracted ([`extractText.ts`](/src/lib/pdf/extractText.ts)) and sent in a single unified structured-output LLM call ([`candidateExtractionService.ts`](/src/lib/extraction/pipeline/candidateExtractionService.ts)) that populates all profile aspects simultaneously.
2. **Canonical Normalization**: Extracted strings for skills, universities, fields of study, and locations are mapped to canonical vocabularies before storage ([`normalizeCandidateProfile.ts`](/src/lib/extraction/normalizers/normalizeCandidateProfile.ts)).
3. **Storage**: The structured profile is persisted in PostgreSQL ([`candidate.ts`](/src/entities/candidate.ts)) with both denormalized top-level SQL columns (for fast search/indexing) and independent JSONB aspect columns.
4. **Deterministic Querying (`Query-Many for Free`)**: When viewing a job's review queue ([`reviewQueueService.ts`](/src/features/review/core/services/reviewQueueService.ts)), pure TypeScript evaluators compare each candidate's stored JSONB profile against the job's active requirements in memory with zero LLM calls.
5. **Interactive Triage UI**: Recruiters filter the pool by epistemic tab (`Confirmed`, `2nd Look`, `Contradicted`), adjust live range sliders (experience, salary, city, university) in [`ReviewFilterPane.tsx`](/src/features/review/views/focus/components/ReviewFilterPane.tsx), inspect verbatim evidence spans in [`CandidateCard.tsx`](/src/features/review/core/components/card/CandidateCard.tsx), and record decisions (`Keep`, `Flag`, `Pass`) with keyboard shortcuts in [`FocusReviewPage.tsx`](/src/features/review/views/focus/FocusReviewPage.tsx).

### 2.2 The 7 Independent Profile Aspects
Each candidate profile ([`ParsedCandidateProfileSchema`](/src/entities/candidate.ts)) is partitioned into independent, versioned aspects under [`/src/entities/extraction/candidate/aspects/`](/src/entities/extraction/candidate/aspects):

| Aspect | Key Extracted Data | Why It Exists Independently |
|---|---|---|
| **`identity`** ([`identity.ts`](/src/entities/extraction/candidate/aspects/identity.ts)) | Name, email, phone, CNIC, location (`raw` + normalized `{ city, province }`), external links (`github`, `linkedin`, `portfolio`, etc.). | Separates contact/deduplication metadata and geographic jurisdiction from qualification evaluation. |
| **`work_history`** ([`workHistory.ts`](/src/entities/extraction/candidate/aspects/workHistory.ts)) | Chronological roles (`entry_id`, `employer`, `title`, `start_date`, `end_date`, `is_current`, `employment_type: full_time \| internship \| contract \| freelance`, `raw_description`). | Allows downstream evaluators to compute verified full-time tenure deterministically from date intervals rather than trusting an LLM's math, while excluding internships/freelance stints from full-time requirements. |
| **`education`** ([`education.ts`](/src/entities/extraction/candidate/aspects/education.ts)) | Degree entries (`institution`, `degree_level` mapped to 5-tier ordinal enum, `field` of study, dates, `grade`). | Enables independent degree-tier rank comparison and university-level pool filtering. |
| **`skills_demonstrated`** ([`skillsDemonstrated.ts`](/src/entities/extraction/candidate/aspects/skillsDemonstrated.ts)) | Skills proven inside a specific `work_history` entry (`source_entry_ref`), tagged with `syntactic_tier` (`action_attributed`, `peripheral_action`, `context_listed`), `outcome_attached` (measurable metric), `concrete_noun_present`, and verbatim `evidence_span`. | Defeats keyword stuffing: only skills where the candidate is the grammatical subject of an ownership verb (`action_attributed`) receive `confirmed` status; passive exposure (`peripheral_action`) or bare role tech-stack lists (`context_listed`) are downgraded to `ambiguous`. |
| **`skills_declared`** ([`skillsDeclared.ts`](/src/entities/extraction/candidate/aspects/skillsDeclared.ts)) | Flat array of skills listed in standalone "Skills" or summary sections without narrative proof. | Captures self-reported claims so they are not lost, but routes any skill found *only* in `skills_declared` ("orphan skill") to `ambiguous` so the recruiter knows to probe it in an interview. |
| **`logistics`** ([`logistics.ts`](/src/entities/extraction/candidate/aspects/logistics.ts)) | Salary expectation (`min`, `max`, `currency`), notice period (`value`, `unit`), relocation willingness, availability, languages. | Enforces a strict non-hallucination boundary: logistics fields are rarely stated on CVs and must default to `not_stated` rather than being guessed. |
| **`extraction_metadata`** ([`extractionMetadata.ts`](/src/entities/extraction/candidate/aspects/extractionMetadata.ts)) | SHA-256 `file_hash`, per-aspect version map (`aspect_versions`), `parse_quality`, and substring verification `warnings`. | Supports content-addressed caching and selective re-extraction if a single aspect's schema evolves. |

**What Aspect Independence Enables vs. Prevents**:
- *Enables*: Modular schema evolution, isolated evaluation benchmarks ([`/src/features/evals/`](/src/features/evals)), and clean separation between proven work-history evidence (`skills_demonstrated`) and self-reported claims (`skills_declared`).
- *Current Limitation*: While `skills_demonstrated` links each skill to a work-history entry via `source_entry_ref`, the current job requirement evaluator checks binary skill presence rather than joining `source_entry_ref` back to `work_history` date ranges to compute **years of experience in a specific skill** or **skill recency/staleness**.

### 2.3 Normalization Pipeline
Normalization runs at **ingestion time** (on extracted candidate profiles in [`candidateExtractionService.ts`](/src/lib/extraction/pipeline/candidateExtractionService.ts)) and at **job creation/update time** (on job requirements in [`jobsService.ts`](/src/features/jobs/jobsService.ts)), ensuring both sides sit in the same canonical space before matching:
- **Skills** ([`skillNormalizer.ts`](/src/lib/extraction/normalizers/skillNormalizer.ts)): Maps raw skill strings against a curated synonym dictionary (`SKILL_SYNONYM_MAP`) into 128 canonical skills ([`canonicalSkills.ts`](/src/lib/extraction/catalogs/canonicalSkills.ts)), with a token-sort-ratio fuzzy matcher (`matchSkill`) built for out-of-dictionary variants.
- **Universities / Institutes** ([`universityNormalizer.ts`](/src/lib/extraction/normalizers/universityNormalizer.ts)): Resolves raw institution names against a Pakistani HEC university catalog ([`universities_pk.json`](/src/lib/extraction/catalogs/universities_pk.json)) using exact alias lookup followed by token-sort-ratio fuzzy matching.
- **Fields of Study** ([`fieldOfStudyNormalizer.ts`](/src/lib/extraction/normalizers/fieldOfStudyNormalizer.ts)): Maps degree majors via a synonym dictionary into 38 canonical academic disciplines ([`canonicalFieldsOfStudy.ts`](/src/lib/extraction/catalogs/canonicalFieldsOfStudy.ts)).
- **Cities & Provinces** ([`identity.ts`](/src/entities/extraction/candidate/aspects/identity.ts), [`locationNormalizer.ts`](/src/lib/extraction/normalizers/locationNormalizer.ts)): Maps Pakistani municipalities to canonical city names and the 7 administrative provinces/territories.

---

## 3. Job Requirements & Result Tags

### 3.1 Job Requirement Schema & Evaluation Approaches
Each requirement on a [`Job`](/src/entities/job.ts) ([`requirements.ts`](/src/entities/extraction/job/requirements.ts)) carries an `active: boolean` flag (whether it is included in evaluation) and a binary `blocking: boolean` flag (`true` = Hard Dealbreaker, `false` = Soft Preferred):

| Requirement Type | Schema Fields | One-Line Evaluation Approach |
|---|---|---|
| **Mandatory & Preferred Skills** (`skills_required`, `skills_preferred`) | `skill: string`, `blocking: boolean` | Deterministic equality on normalized skill names against `skills_demonstrated` and `skills_declared`, assigning `confirmed` only when backed by an `action_attributed` verb in work history and `ambiguous` when found only in declared lists or passive clauses ([`skillEvaluator.ts`](/src/features/review/core/evaluators/skillEvaluator.ts)). |
| **Minimum Experience** (`min_experience`) | `years: number`, `blocking: boolean` | Deterministic numeric comparison (`verifiedYears >= years`) where `verifiedYears` sums merged, non-overlapping calendar months across `full_time` work-history entries ([`experienceEvaluator.ts`](/src/features/review/core/evaluators/experienceEvaluator.ts)). |
| **Minimum Education** (`education_min`) | `degree_level`, `field`, `blocking: boolean` | Deterministic ordinal rank comparison on the 5-tier degree enum combined with normalized field-of-study string equality ([`educationEvaluator.ts`](/src/features/review/core/evaluators/educationEvaluator.ts)). |
| **Location** (`location_requirement`) | `city`, `province`, `blocking: boolean` | Deterministic equality on normalized city and province strings, combined with `stated_relocation_willingness` when the candidate resides in a different city ([`locationEvaluator.ts`](/src/features/review/core/evaluators/locationEvaluator.ts)). |
| **Workplace Mode** (`work_mode`) | `mode: onsite \| hybrid \| remote`, `blocking: boolean` | Deterministic rule evaluation combining required attendance mode, candidate location match, and stated relocation willingness ([`workModeEvaluator.ts`](/src/features/review/core/evaluators/workModeEvaluator.ts)). |
| **Compensation Band** (`compensation_band`) | `min`, `max`, `currency`, `blocking: boolean` | Deterministic numeric comparison (`candidateFloor <= max`) on normalized salary figures after currency alignment ([`compensationEvaluator.ts`](/src/features/review/core/evaluators/compensationEvaluator.ts)). |
| **Max Notice Period** (`max_notice_period`) | `value`, `unit`, `blocking: boolean` | Deterministic numeric comparison (`candidateDays <= maxAllowedDays`) after normalizing days/weeks/months into days ([`noticePeriodEvaluator.ts`](/src/features/review/core/evaluators/noticePeriodEvaluator.ts)). |

### 3.2 Result Tags Shown to the Recruiter
Defined in [`evaluationStatuses.ts`](/src/features/review/core/evaluators/evaluationStatuses.ts) and rendered in [`CandidateCard.tsx`](/src/features/review/core/components/card/CandidateCard.tsx):

| Result Tag | Meaning to the Recruiter | What Is Displayed With It |
|---|---|---|
| **`confirmed`** | Requirement is explicitly met with strong ownership evidence. | Emerald pill on Layer 1 with summary metric (e.g., `4.6 yrs verified` or `Action-attributed in work_1`); verbatim resume sentence quote and outcome metric badge in Layer 2 `EvidenceDrawer`. |
| **`inferred`** | Requirement is satisfied indirectly via a secondary stated fact (e.g., candidate is in Lahore for an Islamabad role, but explicitly stated `"willing"` to relocate). | Sky-blue pill on Layer 1 showing the inference chain (`Lahore -> willing to relocate to Islamabad`); raw location and relocation status in Layer 2. |
| **`ambiguous`** | Mentioned on the resume, but evidence is weak, passive, or incomplete (e.g., skill only listed in `skills_declared`, used with a weak verb like `"familiar with"`, or degree rank met in a different major). | Amber dashed pill on Layer 1 (plus top `BlockingStrip` callout if `blocking: true`); grouped under `"Needs Verification"` in Layer 2 with the exact quote or `"Listed in declared skills section only"`. |
| **`contradicted`** | Explicit resume evidence directly fails the requirement (e.g., 2.5 years full-time vs. 4 years required, or expected salary PKR 550k vs. PKR 450k ceiling). | Rose pill on Layer 1 (and routes candidate to `Contradicted` queue tab if `blocking: true`); grouped at the top of Layer 2 under `"Contradictions"` showing candidate value vs. job limit. |
| **`not_stated`** | The resume is silent on this requirement (most commonly salary expectation, notice period, or an unmentioned skill). | Muted dashed pill on Layer 1; compact 2-column `"Not Stated"` checklist in Layer 2 so the recruiter knows what to ask on a screening call. |

---

## 4. Cost Model & Planned Semantic Queries

### 4.1 Current Cost Model (Parse-Once, Query-Free)
1. **One-Time Ingestion Cost**:
   - Parsing a 1–3 page resume requires one structured-output LLM call ($\approx 3,500$ input tokens for prompt + schema + resume text, and $\approx 1,200$ output tokens for the 6 extracted JSON aspects).
   - On Flash/Mini-class models, raw token cost is $\approx \$0.001\text{--}\$0.0015$ per resume ($\approx \$1.00\text{--}\$1.50$ per 1,000 resumes).
2. **Zero-Cost Post-Ingestion Operations**:
   - Evaluating candidates against a job, toggling criteria between `Hard`/`Soft`/`Excluded`, switching epistemic queue tabs (`Confirmed`, `2nd Look`, `Contradicted`), sliding experience/salary brackets, and filtering by city or university all execute deterministically against PostgreSQL JSONB data at **$0 marginal compute cost**.

### 4.2 Planned: Semantic Queries and How They Change the Cost Story
- **Intended Design** ([`queryEvaluation.ts`](/src/entities/extraction/matching/queryEvaluation.ts)): For open-ended recruiter prompts that cannot be expressed via fixed job fields (e.g., *"Group candidates who have built high-throughput payment settlement systems"* or *"Who shows startup founding experience?"*), the system will batch compact `ParsedCandidateProfile` JSONs (200–400 tokens per candidate rather than 1,500 tokens of raw CV text) into an LLM call (`buildQueryEvaluationPrompt`) that outputs the same epistemic statuses (`confirmed`, `ambiguous`, `contradicted`, `not_stated`), `reasoning`, and verbatim `evidence_spans` per candidate.
- **Cost Impact**: Because semantic queries run at **query time** across $N$ candidates (e.g., 5–10 batched calls per 500 candidates), repeated free-text prompting introduces a variable query-time cost that must be metered per query or capped via per-job query quotas rather than absorbed into flat ingestion pricing.

---

## 5. Core Research Problem: What Characterizes "TOP CANDIDATES"?

### 5.1 Why the Premature "Query Over Job Requirements" Idea Fails
An initial idea was to have an LLM reason over the job requirements (without CVs in context) and emit a deterministic query over those requirement fields to surface "Top Candidates."

**Why that is insufficient**:
- Deterministic job requirements (`min_experience: 4`, `skills_required: ["Go", "PostgreSQL"]`, `education_min: "bachelors"`) are **minimum threshold filters (knockout gates)**, not **excellence differentiators**.
- Suppose 35 candidates out of 300 pass every job requirement (`Confirmed`). If a human recruiter—or an LLM given all 35 CVs in context for pairwise comparison—picks the top 5 candidates, what drives that selection?
- It is driven by **emergent, unstated comparative signals** that no recruiter ever writes as a rigid job requirement:
  1. **Employer Pedigree & Selective Environments**: Candidate A worked at Microsoft, Careem, or a high-bar product company; Candidate B worked at an unknown local body-shop. No SMB job posting in Pakistan lists `"Worked at Microsoft"` as a requirement, yet in pairwise comparison it is an immediate top-tier signal.
  2. **Career Trajectory & Promotion Velocity**: Candidate A went from Junior Engineer to Senior/Lead in 2.5 years at the same company (internal promotion); Candidate B has 5 years of experience composed of five 1-year lateral stints. Both pass `min_experience: 4`, but pairwise comparison strongly favors Candidate A.
  3. **Scale, Complexity & Quantified Impact**: Candidate A's Go evidence span says *"Architected order-routing microservices handling 18,000 req/sec, cutting p99 latency by 44%"*; Candidate B's says *"Developed REST APIs in Go for internal dashboard."* Both get `confirmed` (`action_attributed`), but their engineering depth differs by an order of magnitude.
  4. **Domain & Product Adjacency**: When hiring for a fintech or logistics backend, a candidate who built settlement ledgers or fleet routing at a prior employer wins pairwise comparisons against someone who built e-commerce CMS backends, even when their tool stacks are identical.
  5. **Spiky Excellence & Signal Density**: High-selectivity university + high CGPA (e.g., NUST/FAST/LUMS 3.8+), strong GitHub/open-source/Kaggle presence, or deep adjacent systems mastery (e.g., Rust/C++ concurrency when hiring for Go).

---

### 5.2 The Evolutionary Research Track (Proposals + Inline Summary Critiques)

#### Mechanism A: Ingestion-Time "Calibre & Trajectory" Extraction (Zero Query-Time Cost)
- **What It Suggested**: Extract job-agnostic calibre signals once during ingestion ([`candidateExtractionService.ts`](/src/lib/extraction/pipeline/candidateExtractionService.ts)):
  1. *Employer Signal on `work_history.entries[]`*: Add `employer_archetype` (`"global_tech_leader" | "multinational_enterprise" | "high_growth_product_startup" | "established_local_tech" | "it_services_consultancy" | "non_tech_enterprise" | "freelance_or_self" | "unknown"`) and `domain_tags: string[]` (`["fintech", "payments", "logistics", "e-commerce"]`).
  2. *Deterministic Trajectory & Ownership Signals*: Promotion velocity (ascending seniority at same employer), tenure stability (years divided by stints), and evidence quality density (`syntactic_tier === "action_attributed"` with numeric outcomes).
- **Inline Summary Critique**:
  - *Unbounded Tag Horizon*: Attempting to categorize engineering excellence via fixed enums and tags creates an infinite taxonomy trap. Coarse buckets collapse real pedigree distinctions (Stripe vs. early local startup), while open-ended tags require endless schema expansion.
  - *Context-Blind Isolated Ingestion*: Ingestion parses one CV in a complete vacuum, blind to future jobs and peer applicant pools. A detail like *"migrated Oracle DB to PostgreSQL with zero downtime"* only becomes a decisive differentiator when compared against a specific role and a pool of greenfield CRUD applicants.
  - *Detailed Analysis*: [`01-mechanisms-a-and-b-critique.md`](/docs/research/top-candidates/01-mechanisms-a-and-b-critique.md).

#### Mechanism B: Pool-Aware LLM Query Generation (Zero CVs in Context, Pool Metadata in Context)
- **What It Suggested**: Aggregate distinct pool values in memory before querying:
  - Aggregate `distinct_employers_in_pool`, `distinct_universities_in_pool`, and `skill_outcome_distribution`.
  - Prompt the LLM with `Job Spec + Pool Vocabulary Summary` (~800 tokens) to emit a deterministic scoring or filtering AST without putting individual CVs in context.
- **Inline Summary Critique**:
  - *Feature-Vocabulary Fixation*: You can only pass histograms for columns already anticipated and engineered in the schema. The LLM remains blind to system scale, team leadership, or open-source traction unless new aggregation pipelines and AST operators are manually added.
  - *Collapse of Candidate-Level Joint Context*: Decoupling the pool into separate feature lists destroys candidate-level coherence (the LLM sees `"Microsoft"` in employers and `"Go"` in skills, unable to tell if the Microsoft engineer was a 6-week intern while another candidate built a 20k rps Go ledger).
  - *Detailed Analysis*: [`01-mechanisms-a-and-b-critique.md`](/docs/research/top-candidates/01-mechanisms-a-and-b-critique.md).

#### Mechanism C: The 60-Token "Candidate Micro-Digest" Single-Pass Ranker
- **What It Suggested**: Compress each candidate's structured profile into a dense 60-token Micro-Digest:
  ```text
  [cand_01] 4.6y FT | Sr Backend Eng @ Retailo (2022-Pres), Backend Eng @ Arbisoft (2020-22) | BSc CS @ NUST (3.65 CGPA) | Proven+Metrics: Go ("18k rps, -44% p99"), Postgres ("45M rows, -52% query time"), Docker, REST API ("PKR 120M/mo") | Logistics: PKR 380k, 30d notice, Islamabad
  ```
  Prune hard contradictions, then send all ~80 viable candidate digests in one single LLM call (~4,800 tokens, <$0.002) to select and rank the Top 10.
- **Inline Summary Critique**:
  - *Trapped by the 7-Aspect Schema Boundary*: `skills_demonstrated` only extracts evidence spans anchored to technical skills, completely dropping non-skill engineering ownership (*"Promoted twice to Tech Lead; led 7 engineers and owned post-mortems for PKR 4B/mo ledger"*), while non-work spikes (OSS repositories, hackathon/ICPC wins, notable side projects) have no aspect representation and are discarded at ingestion.
  - *Single-Pass Attention Degradation & Black Box*: Passing 80 dense candidates in a single prompt suffers from positional bias ("lost in the middle") and emits a single-shot ranking with hidden weights, violating Hireflow's anti-black-box thesis (Section 1.3).
  - *Detailed Analysis*: [`02-mechanism-c-critique.md`](/docs/research/top-candidates/02-mechanism-c-critique.md).

#### Mechanism D: Open-World Evidence Capsules + Two-Stage Emergent Axis Discovery
- **What It Suggested**:
  1. *Ingestion*: Generate a ~100-token natural-language Open-World Evidence Capsule (dense 1-line factual role distillations + `notable_signals` for non-work spikes) alongside the 7 JSONB aspects.
  2. *Query Time*: Run a Two-Stage Discovery Funnel: Stage 0 (deterministic knockout prune) $\rightarrow$ Stage 1 (Job Spec + all 40–80 capsules in context to explicitly discover 3–5 pool-relative Emergent Differentiating Axes + Top 20 shortlist) $\rightarrow$ Stage 2 (deep comparative ranking of the Top 20 finalists).
- **Inline Summary Critique**:
  - *Two-Stage Query Funnel Succeeds*: Discovering pool-relative emergent axes in Stage 1 and performing deep comparison in Stage 2 solves both the black-box problem and positional attention bias.
  - *Free-Text Prose Capsule Fails*: Compressing 400–700 tokens of claims into a ~100-token prose summary at ingestion still drops 70–80% of facts blind to the future job/pool. Furthermore, free-text summarization **destroys `syntactic_tier`** by rewriting passive exposure (`peripheral_action`) into active-sounding prose, laundering keyword-stuffers into top-tier candidates while incurring redundant ingestion output tokens.
  - *Detailed Analysis*: [`03-mechanism-d-critique.md`](/docs/research/top-candidates/03-mechanism-d-critique.md).

#### Mechanism E (Current Synthesis): Pointer-Backed Structured Aspect Digests (~150–200 Tokens) + Two-Stage Discovery
- **What It Suggests**:
  1. *Generalized Ingestion Claims*: Generalize `skills_demonstrated` to capture both skill-anchored and scope/leadership-anchored claims with `syntactic_tier`, pre-normalized `raw_nouns`, `outcome_attached`, and verbatim `evidence_span`, plus a `notable_signals` aspect for non-work spikes (OSS, competitions, projects).
  2. *Deterministic TypeScript Serialization*: Serialize every extracted claim as a compact ~10–12 token pointer tuple (`[c1:action] raw_nouns -> compact_action | outcome`). Because each claim is ~10 tokens instead of 30 tokens of prose, all 12–15 claims on a CV fit in ~150–200 tokens with **zero claim dropping**.
  3. *Two-Stage In-Context Discovery + $O(1)$ Quote Hydration*: Stage 1 discovers the pool's emergent axes and shortlists Top 20 citing claim IDs. Stage 2 ranks the Top 10, and TypeScript hydrates verbatim `evidence_span` quotes directly from PostgreSQL JSONB by `claim_id` at zero LLM quote-generation cost and zero hallucination risk.
- **Detailed Specification**: [`04-mechanism-e-pointer-aspect-spec.md`](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md).

---

### 5.3 Experimental Protocol to Validate the 90% Target
To empirically verify that **150–200 Token Structured Aspect Digests + 2-Stage Discovery** hits $\ge 90\%$ agreement with the full-CV oracle and measure the exact ablation gap:
1. **Assemble a 40–50 CV Benchmark Pool**: Combine the 9 golden demo profiles ([`mockCandidates.ts`](/src/db/seeds/mockCandidates.ts)) with 30–40 realistic Pakistani engineering resumes containing diverse emergent signals (Big Tech/Careem alumni, high-scale fintech builders, non-canonical architectural achievements, ICPC/OSS spikes, passive keyword stuffers, fast-promoted mid-levels).
2. **Generate the "Infinite-Budget Oracle" Ranking ($T^*$)**: Run an unconstrained pairwise LLM tournament with full raw resume texts in context + human team verification to establish the ground-truth Top 10 set $T^*$ and the ground-truth reasons why each candidate beat the runner-ups.
3. **Run the 5-Way Ablation (`Recall@10`, `NDCG@10`, and Keyword-Stuffer False Positive Rate)**:
   - **Ablation 1 (Mechanism A)**: Fixed ingestion tags + deterministic ranker.
   - **Ablation 2 (Mechanism B)**: Pool vocabulary summary $\rightarrow$ LLM-emitted deterministic scoring rule.
   - **Ablation 3 (Naive 60-Token Post-Normalized Digest)**: Built only from canonical `skills_demonstrated` names + `education` + `work_history` titles.
   - **Ablation 4 (100–150 Token Free-Text Prose Capsule)**: LLM-summarized role prose (testing how often passive keyword stuffers sneak into Top 10 when `syntactic_tier` is lost and how often niche domain signals are dropped at ingestion).
   - **Ablation 5 (Proposed 150–200 Token Pre-Normalized Structured Aspect Digest + 2-Stage Discovery)**: Generalized structured claims with `[claim_id:syntactic_tier]`, raw domain nouns, outcomes, deterministic trajectory math, and non-work spikes.
4. **Analyze Error Cases**: For any candidate in $T^*$ missed by Ablation 5, inspect whether the miss was caused by **(a) aspect extraction miss** or **(b) query-time ranking variance**.

---

## 6. Business Value Analysis & Where to Sharpen the Story

### 6.1 Where the Pitch Is Strongest Today
1. **Defeating AI Resume Inflation (`skills_demonstrated` vs. `skills_declared`)**: Recruiters today are flooded with ChatGPT-polished resumes that stuff every keyword from the job description. Showing that Hireflow syntactically separates *proven ownership with metrics* (`confirmed`) from *unbacked skill lists* (`ambiguous`) is an immediate, visceral win in a live demo.
2. **Zero-Friction Off-Platform Screening**: Positioning against Rozee not by claiming "better AI," but by pointing out a structural lock-in: *Rozee only screens candidates inside Rozee; Hireflow screens the 200 PDFs sitting in your WhatsApp and email right now.*
3. **Pool Reality Brackets Before Reading**: Showing a hiring manager that *"Only 4 of your 180 applicants live in Islamabad, have 4+ years of Go, and fit your PKR 350k budget—if you raise the ceiling to 420k, you unlock 14 more"* turns Hireflow from a passive filter into a compensation and sourcing negotiation tool.

### 6.2 Weaknesses in the Current Story & How to Fix Them
1. **The "Unstated Logistics" Trap in `Confirmed` (`fast_clear`)**:
   - *The Weakness*: In Pakistan, $<10\%$ of CVs state expected salary or notice period on the document. Currently, `compensation_band` and `max_notice_period` default to `blocking: true` ([`requirementsData.ts`](/src/features/jobs/views/new-job/components/ScreeningCriteria/requirementsData.ts)), and `Confirmed` (`fast_clear`) requires all blocking items to be `confirmed` ([`reviewQueueService.ts`](/src/features/review/core/services/reviewQueueService.ts)). In a real batch of 100 CVs, almost **zero candidates** will appear in `Confirmed` because their salary is `not_stated`.
   - *The Fix*: Treat `not_stated` on logistics (salary/notice) as *"Pass to Interview / Verify on Call"* rather than a blocking failure, reserving blocking exclusion strictly for `contradicted` (when a candidate explicitly states a salary above budget).
2. **The "$1 per 1,000 CVs" Pricing Claim**:
   - *The Weakness*: Raw token cost for rich 7-aspect extraction is already $\approx \$1.00\text{--}\$1.50$ per 1,000 CVs. Pricing at $\$1 / 1,000$ CVs leaves zero margin and breaks immediately if the user runs re-extractions, Top Candidate queries, or semantic group queries.
   - *The Fix*: Frame pay-on-compute around **Job Screening Batches**—e.g., **PKR 1,500–2,500 ($\approx \$5\text{--}\$9$) per job batch (up to 250 CVs + Top Candidates & semantic queries included)**. For a Pakistani SMB or freelance recruiter, PKR 2,000 per role is an impulse buy ($10\times$ cheaper than job boards or ATS seats) while giving Hireflow an **85%+ gross margin**.
3. **Skill-Specific Experience vs. Total Career Experience**:
   - *The Weakness*: Currently, `min_experience` sums all full-time roles regardless of stack. A candidate with 4 years of WordPress/PHP and 3 months of Go passes `4+ years experience` + `Go confirmed`.
   - *The Fix*: Join `skills_demonstrated.source_entry_ref` to `work_history.entries` date intervals so Hireflow can display **verified years per required skill** (e.g., `Go: 1.5 yrs across 1 role | Total FT: 4.5 yrs`).

---

## 7. Prioritized Next Steps for the Team

1. **Prototype & Benchmark the 150–200 Token Structured Aspect Digest + 2-Stage Ranker (Mechanism E, Section 5.2 & 5.3)**:
   - Generalize `skills_demonstrated` claim extraction to also capture non-skill role scope/leadership claims (retaining `syntactic_tier`, raw pre-normalized domain nouns, `outcome_attached`, and `evidence_span`) plus a `notable_signals` array for non-work-history spikes (OSS, projects, competitions, honors).
   - Build the deterministic TypeScript serializer that formats each candidate's stored JSONB aspects into a ~150–200 token pointer-backed digest (`[c1:action] raw_nouns -> compact_action | outcome`) and benchmark the 2-stage comparative tournament against the full-CV pairwise oracle ($T^*$).
2. **Fix Logistics Blocking Behavior for Real Resumes**:
   - Separate *Qualification Dealbreakers* (skills, experience, degree—where `not_stated` means missing) from *Logistics Dealbreakers* (salary, notice period—where `not_stated` is normal and only `contradicted` should block `Confirmed` status).
3. **Wire Per-Skill Duration & Recency from `source_entry_ref`**:
   - Compute how many months each demonstrated skill was used and whether it appears in `is_current` work history, turning the existing schema link (`source_entry_ref -> entry_id`) into a major product differentiator.
4. **Re-enable Equivalence Clusters in Evaluators**:
   - Reconnect `FIELD_EQUIVALENCE_CLUSTERS` ([`fieldOfStudyNormalizer.ts`](/src/lib/extraction/normalizers/fieldOfStudyNormalizer.ts)) and `matchSkill` ([`skillNormalizer.ts`](/src/lib/extraction/normalizers/skillNormalizer.ts)) in the review evaluators so candidates with equivalent degrees (e.g., `Software Engineering` for a `Computer Science` role) are not downgraded to `ambiguous`.
