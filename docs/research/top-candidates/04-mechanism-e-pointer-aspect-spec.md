# Technical Specification: Mechanism E (Pointer-Backed Structured Aspect Digests)

## 1. Executive Summary

Mechanism E is the architectural synthesis resulting from an adversarial review of **Mechanism D** (Open-World Evidence Capsules and Two-Stage Discovery).

While Mechanism D correctly established a **two-stage query funnel** (Stage 1 discovery $\rightarrow$ Stage 2 tournament), its ingestion representation—free-text natural-language prose summaries—introduced severe failure modes: context-blind fact discarding, syntactic tier laundering, and low fact density per token in the query-time prompt.

Mechanism E addresses these failures while preserving the open-world discovery benefits:
- It replaces free-text role summaries with **propositional extraction (de-noising)** into compact structured tuples (`{raw_nouns} -> {compact_action} | {outcome_attached}`) backed by verbatim resume sentences stored in PostgreSQL JSONB.
- It attaches explicit `syntactic_tier` tags per claim and per skill, immunizing the screening engine against resume inflation.
- Using an elastic token budget (~150–200 tokens on typical profiles, scaling with candidate density), extracted claims serialize deterministically into a structured digest in TypeScript with no LLM call at query time. The structured fields themselves are paid for as extra output tokens at extraction time (Section 2.6).
- At query time, Stage 1 discovers pool-relative emergent axes, and Stage 2 outputs a **per-axis evaluation matrix** across all 20 finalists, powering interactive emergent-axis UI controls at $0 marginal cost with $O(1)$ hallucination-free quote hydration.

Three questions carried over from earlier mechanisms remain **open and unvalidated** in E: whether pool-blind de-noising actually avoids dropping pool-relevant facts (Section 2.1, Section 3.2), attention drop-off across 40–80 candidates in Stage 1 (Section 2.5), and token cost as a trade-off between extraction overhead and query-time savings (Section 2.6). The validation plan is in [05-test-bench.md](/docs/research/top-candidates/05-test-bench.md).

---

## 2. Earlier Criticisms: The Journey from Mechanisms C and D to E

Mechanism D attempted to solve pre-defined feature lock-in by generating an "Open-World Evidence Capsule" (~100 tokens of 1-line role distillations in natural language prose) at ingestion. Adversarial examination revealed four critical failure modes that necessitated Mechanism E (Sections 2.1–2.4). Two further criticisms, raised against Mechanisms C and D, carry over to E and are only partially addressed by it (Sections 2.5–2.6).

### 2.1 Failure Mode 1: Context-Blind Fact Discarding at Serial Ingestion
- **The Token Reality**: A typical 2-page engineering resume contains **400 to 700 tokens of claim-bearing sentences** across 3–4 roles, 15–25 bullet points, and education/projects.
- **The Loss**: Forcing the ingestion LLM to compress an entire candidate into a ~100-token natural-language summary requires discarding **70% to 80% of that content**.
- **Context-Blind Prior**: Because ingestion occurs in a vacuum (blind to future job specs and peer applicant pools), the ingestion LLM must use a generic, ungrounded salience heuristic. It will keep generic headline metrics (*"improved performance by 25%"*) and discard niche domain or architectural mechanisms (*"implemented idempotent webhook retry queue for 1Link settlements"*). If a future job specifically seeks payment reconciliation depth, that decisive signal was permanently discarded at ingestion.
- **How Far E Resolves This (Open)**: Mechanism E replaces 1-line role summarization with per-claim propositional de-noising (Section 3.2), betting that once grammatical scaffolding and generic duty filler are stripped from those 400–700 tokens, the remaining factual propositions fit in ~150–200 tokens without dropping substantive claims. Whether that budget holds and whether the extractor's "filler vs. claim" threshold still drops pool-relevant details in practice is unmeasured ([05-test-bench.md](/docs/research/top-candidates/05-test-bench.md), Experiments 1 and 5).

### 2.2 Failure Mode 2: Laundering `syntactic_tier` (Breaking Hireflow's Core Moat)
Hireflow's primary competitive advantage is syntactically verifying claims:
- `action_attributed`: Candidate was the active grammatical subject of an ownership verb (*"Architected the settlement microservice"*).
- `peripheral_action`: Candidate had passive or team-level exposure (*"Assisted team with settlement microservice updates"*).
- `context_listed`: Bare tool name listed in a role summary without proof.

When an LLM summarizes a resume into telegraphic 1-line prose, it naturally paraphrases and compacts text. In doing so, LLMs routinely **rewrite passive involvement into active-sounding phrasing** (*"Assisted team with settlement microservice"* becomes *"Handled settlement microservices"*). Free-text prose capsules launder keyword-stuffer claims into top-tier summaries, directly undermining Hireflow's anti-inflation verification engine.

### 2.3 Failure Mode 3: Prose Inefficiency and Ingestion Output-Token Overhead
- **Prose Inefficiency**: Natural language prose requires grammatical scaffolding, pronouns, articles, and connective verbs, wasting 30% to 40% of its token budget on non-information tokens.
- **Output Token Cost**: Generating a prose summary at ingestion adds LLM generation output tokens (the most expensive token category) to every single uploaded CV. This objection does not favour E over D: E's structured fields add more extraction output tokens than D's capsule (Section 2.6).

### 2.4 Failure Mode 4: Citation Tunnel Vision and Static Axis Display Traps
- **Citation Tunnel Vision**: If Stage 2 only hydrates verbatim evidence spans for the 1–2 `claim_id`s cited in Stage 1, it introduces severe confirmation bias. When comparing candidates across secondary emergent axes, uncited claims remain unhydrated or omitted, blinding the final tournament to valid candidate evidence.
- **Static Axis Display Trap**: If Stage 2 only outputs a monolithic Top 10 list, the discovered emergent axes shown in the UI are merely decorative. A recruiter cannot toggle or re-weight an axis to explore different candidate rankings without triggering another expensive LLM call.

### 2.5 Carried-Over Criticism 1: Attention Drop-Off Across 40–80 Candidates (Status: Open)
- **Origin**: Mechanism C was rejected partly for "lost in the middle" ([02-mechanism-c-critique.md](/docs/research/top-candidates/02-mechanism-c-critique.md), Section 4). With ~80 digests x 60 tokens (~4.8k tokens) in one prompt, the model attends less to candidates in the middle third, so a strong candidate at position 42 gets overlooked.
- **What E does**: Stage 1 places the same 40–80 candidates in one prompt. Each digest is now 150–200 tokens, so the prompt is ~8k–12k tokens.
- **Why compression does not fix it**: Shrinking each candidate reduces total context compared to raw CVs (120k+ tokens), but positional bias depends on **where an item sits among many items**, not only on total token count. Stage 1 still reads all 40–80 candidates in a single pass.
- **Why two stages do not fix it**: Asking for a Top 20 instead of a Top 10 makes the task easier, so recall should improve somewhat. But a candidate missed in Stage 1 **never reaches Stage 2**. The bias is moved into the one step whose mistakes cannot be undone. Emergent axes are also discovered in Stage 1, so they will lean toward signals held by candidates near the start and end of the prompt.
- **Consistency note**: At 8k–12k tokens, modern models may show only a modest effect. Either the effect matters at this size, in which case E inherits it, or it does not, in which case rejecting C on this ground was overstated. The argument cannot be used against C and waived for E.
- **How to settle it**: Run Stage 1 on several shuffled orderings of the same pool and measure shortlist overlap and position-dependent inclusion ([05-test-bench.md](/docs/research/top-candidates/05-test-bench.md), Experiment 3).
- **Candidate mitigations (unvalidated)**: shuffled multi-run voting, chunked Stage 1 with merged axes, or splitting axis discovery (needs the pool) from per-candidate axis scoring (does not need the pool).

### 2.6 Carried-Over Criticism 2: Token Cost at Extraction Time vs. Query Time (Status: Trade-Off, Unmeasured)
Cost has to be split into two separate token streams:

| | Query time (what the ranking LLM reads) | Extraction time (what the ingestion LLM writes) |
|---|---|---|
| **Mechanism D** | ~100 tokens of prose capsule per candidate | ~100 extra output tokens per CV |
| **Mechanism E** | ~150–200 token digest per candidate, serialized in code | Every claim written out as a structured JSON object |

- **Query time (E benefits)**: The digest is assembled in TypeScript from stored JSONB, with no LLM call. It is denser than prose (`[c1:action] Go, gRPC -> architected order routing | 18k rps`), and 40–80 digests fit in ~8k–12k tokens instead of 120k+ tokens of raw CVs. The "prose wastes tokens on grammar" argument (Section 2.3) applies here, and here E wins.
- **Extraction time (E adds overhead)**: The digest can only be built if the extraction LLM first **outputs** every field. A rough per-claim estimate:

  ```text
  {"claim_id":"c1","source_entry_ref":"work_1","claim_tier":"action_attributed",          ~25  (keys, structure)
   "skills":[{"skill":"Go","syntactic_tier":"action_attributed","canonical_skill":"go"}],  ~20
   "raw_nouns":["gRPC","Kafka","order-routing microservices"],                            ~10
   "compact_action":"architected order-routing microservices",                            ~10
   "outcome_attached":"18k rps, -44% p99",                                                 ~8
   "evidence_span":"Architected order-routing microservices in Go and gRPC ..."}          ~30
  ```

  This is roughly 100 output tokens per claim, or ~1,500 for 15 claims. The current `skills_demonstrated` aspect already pays for part of this, so the realistic increase is roughly **+500 to +1,500 output tokens per CV**, compared with the ~100 used to reject D. JSON keys, quotes, and braces are their own scaffolding overhead, the same kind of waste held against prose in Section 2.3. Output tokens also dominate per-CV extraction latency.
- **Is the overhead worth it**: Likely yes, but for structural reasons, not cost reasons. E's extra tokens buy reusable structure: an ownership tier per claim and per skill (also usable by the deterministic skill evaluator), claim IDs for quote lookup instead of regeneration, a verbatim quote behind every claim, and a compact query-time digest. D's extra ~100 tokens bought a lossy summary. At the cost figures in [IDEA_AND_RESEARCH.md](/docs/IDEA_AND_RESEARCH.md) (Section 4.1), a rough doubling of output tokens moves ingestion from ~$1–1.5 to an estimated ~$2–3 per 1,000 CVs, which is small against per-job batch pricing.
- **Conclusion**: Cost is not a valid reason to prefer E over D. E's justification rests on structure, tier integrity, and query-time density. The actual extraction delta is unmeasured ([05-test-bench.md](/docs/research/top-candidates/05-test-bench.md), Experiment 4).
- **Possible reduction (unvalidated)**: Store `evidence_span` as character offsets (`{start, end}`) into the stored raw text instead of a copied sentence. This removes the largest field from the output, and code can guarantee the quote is exact.

---

## 3. Theoretical Foundation: Why Mechanism E Beats Web Drag-and-Drop and the De-Noising Hypothesis for Serial Ingestion

### 3.1 Why Users of "Drag-and-Drop in ChatGPT/Claude" Will Migrate to This
The primary competitor to structured candidate screening is not legacy ATS platforms, but recruiters dragging 20 to 50 raw PDF resumes directly into an LLM chat window (ChatGPT, Claude) and asking: *"Who are the top candidates and why?"*

Recruiters use this workflow because putting all candidates into the same context window allows the LLM to perform open-world comparative analysis and surface pool-relative axes of excellence that were never specified in a rigid job description.

However, raw document drag-and-drop suffers from four structural limitations that Mechanism E addresses:

1. **Upload Limits and Context Size**:
   - 80 raw resume PDFs consume 120,000+ tokens. Over 70% of those tokens are boilerplate duty descriptions, layout headers, and formatting artifacts.
   - In massive context windows, attention degrades over candidates positioned in the middle.
   - In Mechanism E, 80 candidates serialized into dense factual propositions require ~12,000 tokens. This removes the upload limit and reduces query-time tokens, but it does not remove positional bias across 40–80 candidates in one prompt (Section 2.5).

2. **Epistemic Immunization Against AI-Generated Resume Inflation**:
   - ChatGPT drag-and-drop is vulnerable to inflated prose. A candidate who writes *"Spearheaded cross-functional alignment across platform squads scaling Go microservices"* routinely outranks a candidate who plainly writes *"Built Go payment settlement microservices."*
   - Mechanism E extracts and enforces explicit syntactic ownership (`[action_attributed]` vs. `[peripheral_action]`) and calculates verified full-time tenure in code. The query-time LLM observes verified evidence tiers rather than persuasive rhetoric.

3. **Deterministic Knockouts Before Emergent Comparison**:
   - Raw chat queries frequently select a "Top Candidate" who fails non-negotiable logistical or qualification requirements (e.g., located in the wrong city, demanding twice the salary ceiling, or holding 1.5 years of experience padded by internships).
   - Mechanism E executes Stage 0 deterministic filtering at $0 cost, guaranteeing that every candidate entering comparative ranking is a viable contender.

4. **Interactive Pool Differentiators and Auditable Evidentiary Proof**:
   - Rather than returning an ephemeral, unstructured chat response, Mechanism E exposes discovered pool differentiators as interactive controls in the UI, backed by literal quote spans fetched directly from JSONB.

### 3.2 The Serial Ingestion Hypothesis: De-Noising vs. Summarization (Status: Unvalidated)
The core theoretical objection to serial (one-by-one) resume ingestion is the **pool-blindness trap**:
> *If an LLM processes CVs one by one at ingestion without knowing the job spec or the rest of the pool, how can it compress a 1,500-token CV down to ~150 tokens without throwing away subtle details that might turn out to be the decisive differentiator in a future applicant pool?*

Mechanism E's hypothesis is that this depends on distinguishing between two types of compression:

1. **Selection / Summarization (Fails at Serial Ingestion)**:
   - Instructing the ingestion LLM to summarize each role into a 1-line highlight forces it to judge *which* facts are important while completely blind to the pool. The LLM inevitably retains generic high-level metrics (*"improved performance by 25%"*) and discards niche domain or architectural mechanisms (*"implemented idempotent webhook retry queue for 1Link settlements"*). If the pool later turns on payment reconciliation depth, that decisive signal was permanently discarded.

2. **De-Noising / Propositional Extraction (Mechanism E's Hypothesis)**:
   - The hypothesis models a 1,500-token resume as roughly:
     - ~400 tokens of layout headers, contact blocks, generic career objectives, and repeated skill tags.
     - ~450 tokens of generic duty filler (*"Collaborated with Agile squads, attended standups, wrote clean maintainable code"*).
     - ~450 tokens of grammatical scaffolding (*"Was responsible for leading the development of..."* = 8 tokens to express an active ownership predicate) wrapped around the 400–700 tokens of claim-bearing sentences noted in Section 2.1.
     - **An estimated ~150–200 tokens of unique factual propositions** (proper nouns, systems, architectures, domain workflows, metrics, tools, and awards) once that scaffolding is stripped.
   - If the serial extraction prompt is instructed **not to judge which concrete fact is important**, and instead to **extract every specific claim, noun, and metric while stripping only generic duty clichés and grammatical filler**, it should preserve far more pool-relevant detail than summarization.
   - **Why this remains an open hypothesis rather than a guarantee**:
     1. *Unverified token budget*: Whether stripping filler and grammar from 400–700 tokens of claim-bearing prose actually lands at ~150–200 tokens without dropping claims has not been measured on real CVs. If a dense CV still holds 350+ tokens of propositions, a 150–200 token ceiling becomes selection again, while letting the digest grow increases Stage 1 context size.
     2. *Pool-blind threshold*: Deciding where "generic duty filler" ends and a "concrete claim" begins (e.g., *"attended standups"* vs. *"ran daily triage across 3 payment squads"*) is still a judgment made without seeing the job or pool. It is a lower threshold than 1-line summarization, not a lossless one.
     3. *Non-tuple signals*: Signals that do not fit an `{actor, action, outcome}` tuple—such as company stage or size (*"first engineer at a 4-person startup"*), cross-claim implausibility, or heavy filler density as a negative signal—are not captured by claim tuples.
   - These three risks are tested directly by Experiments 1, 5, and 6 in [05-test-bench.md](/docs/research/top-candidates/05-test-bench.md).

### 3.3 What "Precisely Expanded Extraction" (~150–200 Tokens) Looks Like
To minimize emergent signal loss during serial ingestion, extraction follows three principles:

1. **Extract Every Concrete Claim Across Work and Non-Work**:
   - Rather than restricting evidence extraction to canonical skill catalogs, extract every non-generic claim into a structured tuple preserving proper nouns, domain concepts, and metrics:
     - *Raw Resume (42 tokens)*: `"Worked as a core member of the payments engineering squad where I designed and implemented an idempotent reconciliation worker in Go for Raast and 1Link settlements, reducing failed transaction disputes by 38% across 2M daily txns."`
     - *Extracted Aspect Tuple (16 tokens)*: `[action] Go idempotent reconciliation worker (Raast/1Link settlements, 2M daily txns, -38% disputes)`
   - The nouns (`Raast`, `1Link`, `idempotent reconciliation worker`, `Go`), mechanism, metric (`2M daily txns`, `-38% disputes`), and ownership tag (`[action]`) are retained without keeping the surrounding clause structure.

2. **Elastic Token Budgets Proportional to Factual Density**:
   - Entry-level candidates may possess ~70 tokens of concrete factual content; a 10-year lead engineer may possess ~220+ tokens across multiple systems and roles.
   - The serialized digest scales elastically with the candidate's extracted claims rather than enforcing a hard per-CV token cap that would truncate senior profiles.

3. **In-Context Comparative Reasoning Across the Contender Pool**:
   - All 40–80 viable contenders are placed simultaneously into the query prompt (~8k–12k tokens). To the extent that the extracted tuples preserve each candidate's concrete claims, the LLM can discover emergent axes across the pool without loading full raw CVs.

---

## 4. Ingestion Schema Upgrades

Mechanism E introduces two targeted structures to the existing JSONB aspect model in `/src/entities/extraction/candidate/aspects/`:

### 4.1 Role Claims (`ExtractedRoleClaim`)
Inside `work_history`, claims are stored as structured tuples. To prevent multi-skill sentences from corrupting deterministic skill verification, each skill within a claim retains its own syntactic tier alongside the overall claim tier:

```typescript
export interface ExtractedClaimSkill {
  skill: string; // Raw extracted skill name, e.g., "Go", "Kubernetes"
  syntactic_tier: "action_attributed" | "peripheral_action" | "context_listed";
  canonical_skill: string | null; // Resolved via skillNormalizer.ts for $0 requirement matching
}

export interface ExtractedRoleClaim {
  claim_id: string; // Unique deterministic ID within profile, e.g., "c1", "c2"
  source_entry_ref: string; // Links to work_history entry_id
  claim_tier: "action_attributed" | "peripheral_action" | "context_listed"; // Overall predicate ownership
  skills: ExtractedClaimSkill[]; // Per-skill tier attribution (prevents passive skills from inheriting active status)
  raw_nouns: string[]; // Domain nouns, architectures, systems, e.g., ["gRPC", "Kafka", "order-routing microservices"]
  compact_action: string; // Elastic factual predicate (5-12 words, preserving core mechanisms and secondary clauses)
  outcome_attached: string | null; // Quantified impact, e.g., "18k rps, -44% p99 latency"
  evidence_span: string; // Complete verbatim resume sentence stored in PostgreSQL JSONB
}
```

### 4.2 Non-Work Outlier Spikes (`ExtractedNotableSignal`)
To capture high-signal achievements outside standard corporate employment without falling into closed-world classification traps, `ExtractedNotableSignal` uses an open string `context_label` reflecting the source domain:

```typescript
export interface ExtractedNotableSignal {
  signal_id: string; // e.g., "s1", "s2"
  context_label: string; // Open-world category, e.g., "Open-Source", "Competition", "Project", "Certification", "Patent", "Security / CVE", "Honor"
  syntactic_tier: "action_attributed" | "peripheral_action";
  raw_nouns: string[]; // e.g., ["go-rate-limit", "distributed-systems"]
  compact_action: string; // e.g., "Maintained open-source distributed rate limiter"
  outcome_attached: string | null; // e.g., "1.4k GitHub stars"
  evidence_span: string; // Complete verbatim resume sentence
}
```

---

## 5. Deterministic Aspect Serialization in TypeScript

At query time, TypeScript compiles the candidate profile into a compact, pointer-backed digest at **$0 marginal compute cost** (the extraction-time cost of producing these fields is covered in Section 2.6):

```text
[cand_01] 4.6y FT (2 roles, avg 2.3y) | BSc CS @ NUST (3.65) | Islamabad, PKR 380k, 30d notice
work_1: Sr Backend Eng @ Retailo (promoted from SWE, 2022-Pres, 2.8y FT)
  [c1:action] Go, gRPC, Kafka -> architected order-routing microservices | 18k rps, -44% p99
  [c2:action] Postgres, Redis -> built multi-tenant inventory ledger | 45M rows, -52% query time
  [c3:action] Squad leadership -> led 6 engineers and owned checkout SLA | 99.99% uptime
work_2: Backend Eng @ Arbisoft (2020-2022, 1.8y FT)
  [c4:action] Python, Django, REST API -> developed B2B vendor settlement portal | PKR 120M/mo
  [c5:peripheral] Kubernetes, Terraform -> assisted platform squad with deployment pipeline maintenance
spikes:
  [s1:action] Open-Source: go-rate-limit -> maintainer of distributed rate limiter | 1.4k GitHub stars
```

### Key Properties of This Digest:
1. **Fact-Density**: 15 distinct factual claims, tools, domain concepts, metrics, and tenure data points fit inside ~160 tokens.
2. **Zero Pre-Normalization Loss**: Uncataloged domain terms (`multi-tenant inventory ledger`, `B2B vendor settlement portal`, `go-rate-limit`) are preserved directly in `raw_nouns` and `compact_action`.
3. **Deterministic Trajectory**: Total full-time years (`4.6y FT`), role progression (`promoted from SWE`), and tenure stability are calculated in code before prompt assembly.
4. **Epistemic Transparency**: Every claim explicitly displays its ownership tier (`[c1:action]` vs. `[c5:peripheral]`), preventing keyword inflation.

---

## 6. The Two-Stage In-Context Discovery Pipeline

```text
200 Resumes in Job Pool
  │
  ├─► Stage 0: Deterministic Gatekeeper ($0, TypeScript)
  │     Filter out hard `contradicted` dealbreakers
  │     (keep `confirmed`, `inferred`, `2nd Look`, and `not_stated` logistics)
  │     ──> ~40–80 Viable Contenders
  │
  ├─► Stage 1: In-Context Pool Discovery & Shortlist (~8k–12k tokens, 1 LLM call)
  │     Input: Job Spec + All 40–80 Structured Aspect Digests
  │     Output:
  │       1. 3–5 Emergent Differentiating Axes discovered in THIS pool for THIS job
  │       2. Top 20 Shortlist with citing claim IDs (e.g., [cand_01:c1, c3])
  │
  └─► Stage 2: Deep Comparative Tournament & Per-Axis Evaluation Matrix (~5k–7k tokens, 1 LLM call)
        Input: Job Spec + Emergent Axes + All 20 Finalists (with ALL verbatim evidence spans hydrated)
        Output:
          1. Per-Axis Evaluation Matrix for all 20 finalists (scores + claim citations)
          2. Ordered Top 10 Ranking with comparative pool-relative rationales
```

### 6.1 Stage 0: Deterministic Gatekeeper ($0, TypeScript)
Using existing evaluators in `/src/features/review/core/evaluators/`, prune candidates who violate hard dealbreakers (`min_experience`, mandatory degree level, explicit salary above maximum). Candidates with `not_stated` logistics or minor soft gaps are retained, narrowing the pool to 40–80 viable contenders at zero cost.

### 6.2 Stage 1: In-Context Pool Discovery & Shortlisting (~8k–12k Tokens)
All 40–80 structured digests are placed into context alongside the job description. The LLM performs two tasks in a single prompt:
1. **Identifies 3–5 Emergent Differentiating Axes**: Discovers what separates the upper echelon in this specific pool relative to the job's core challenges (e.g., high-throughput concurrency, ledger reconciliation depth, rapid internal promotion).
2. **Selects Top 20 Shortlist**: Filters contenders down to 20 finalists, tagging primary claim citations for each selection. The shortlist is intended to be high-recall, but Stage 1 recall under positional bias is unvalidated (Section 2.5).

### 6.3 Stage 2: Deep Comparative Tournament & Per-Axis Evaluation Matrix (~5k–7k Tokens)
For the 20 finalists, TypeScript hydrates **all** verbatim `evidence_span` sentences from PostgreSQL JSONB (~250 tokens per candidate $\times 20 = 5,000$ tokens).

Hydrating all claims across the 20 finalists prevents confirmation bias: claims that were not cited in Stage 1 remain fully visible when evaluating secondary emergent axes in Stage 2.

The Stage 2 LLM evaluates the 20 finalists head-to-head across the discovered axes and outputs:
1. **The Per-Axis Evaluation Matrix**: A structured scoring breakdown (`strong` | `moderate` | `none`) linking each candidate to specific `claim_id` pointers for each axis.
2. **Default Composite Top 10**: The initial ranked list with pool-relative comparative rationales.

### 6.4 Why the Per-Axis Matrix Enables Truly Interactive Axis Badges at $0
Because Stage 2 emits an evaluation matrix across all 20 finalists for each emergent axis, the UI can render the Emergent Differentiators as interactive pill toggles:
- If a recruiter unchecks an axis (e.g., *"Open-Source Traction"* is deemed irrelevant for an internal enterprise backend role), TypeScript recalculates the composite ordering over the 20 finalists instantly in memory.
- **Zero additional LLM calls or latency**: Recruiters can customize and explore the emergent criteria dynamically at $0 marginal compute cost.

### 6.5 $O(1)$ Hallucination-Free Verbatim Quote Hydration
When rendering candidate evidence cards in the UI:
- The UI references the `claim_id` emitted by the LLM (e.g., `cand_01:c1`).
- TypeScript resolves `c1` directly against the stored JSONB aspect profile to display the literal quote:
  > *"1 of 3 candidates in pool with verified >10k rps Go scale: 'Architected order-routing microservices in Go and gRPC handling 18,000 req/sec, cutting p99 latency by 44%' (Retailo)"*
- This requires **zero LLM generation tokens** for quote reproduction, eliminating quote transcription hallucinations entirely.

---

## 7. Comparison Across Iterations

| Capability | Mechanism C (Micro-Digest) | Mechanism D (Prose Capsule) | Mechanism E (Pointer Aspect Digest) |
|---|---|---|---|
| **Digest Token Budget** | ~60 tokens | ~100 tokens (prose) | ~150–200 tokens (elastic) |
| **Ingestion Extraction Mode** | Closed-world canonical skills | Open-world prose summarization | Open-world factual propositional de-noising |
| **Syntactic Tier Integrity** | Preserved | Risk of paraphrasing laundering | Preserved per claim and per skill |
| **Non-Work Outlier Capture** | Dropped | Captured in prose | Captured via open `context_label` |
| **Emergent Axis Discovery** | None (Single pass) | Yes (Stage 1) | Yes (Stage 1) |
| **Stage 2 Evidence Scope** | N/A | Selective cited claims (tunnel vision) | Full claim hydration across 20 finalists |
| **Interactive UI Badges** | None | Static display | Dynamic re-ranking via per-axis matrix ($0) |
| **Quote Grounding** | Re-extracted or truncated | Paraphrased | $O(1)$ JSONB pointer resolution |
