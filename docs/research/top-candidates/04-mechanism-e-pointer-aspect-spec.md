# Technical Specification: Mechanism E (Pointer-Backed Structured Aspect Digests)

## 1. Executive Summary

Mechanism E is the architectural synthesis resulting from an adversarial review of **Mechanism D** (Open-World Evidence Capsules and Two-Stage Discovery).

While [Mechanism D](/docs/research/top-candidates/03-mechanism-d-critique.md) introduced the **two-stage query funnel** (Stage 1 discovery $\rightarrow$ Stage 2 tournament), its free-text prose capsule and selective Stage 2 handoff failed on fact retention, syntactic tier integrity, query-time density, and Stage 2 coverage ([03-mechanism-d-critique.md](/docs/research/top-candidates/03-mechanism-d-critique.md), Section 4).

Mechanism E keeps D's two-stage funnel and replaces the ingestion representation and Stage 2 handoff:
- It replaces free-text role summaries with **propositional extraction (de-noising)** into compact structured tuples (`{raw_nouns} -> {compact_action} | {outcome_attached}`) backed by verbatim resume sentences stored in PostgreSQL JSONB.
- It attaches explicit `syntactic_tier` tags per claim and per skill, immunizing the screening engine against resume inflation.
- Using an elastic token budget (~150–200 tokens on typical profiles, scaling with candidate density), extracted claims serialize deterministically into a structured digest in TypeScript with no LLM call at query time. The structured fields themselves are paid for as extra output tokens at extraction time (Section 2.3).
- At query time, Stage 1 discovers 3–5 pool-relative emergent axes as a shared yardstick, Stage 2 runs reshuffled halving rounds on groups of ~8 digests (keeping the top 4 per group across reversed orders so no Top 3 contender can be eliminated by grouping), and Stage 3 ranks the final ~8 on full CVs + tier-tagged claims via balanced permutations and bidirectional pairwise checks to surface a **Confident or Contested Top 3** with $O(1)$ quote hydration.

Two questions carried over from earlier mechanisms remain **open and unvalidated** in E: whether pool-blind de-noising actually avoids dropping pool-relevant facts (Section 2.1, Section 3.2), and token cost as a trade-off between extraction overhead and query-time savings (Section 2.3). The validation plan is in [05-test-bench.md](/docs/research/top-candidates/05-test-bench.md).

---

## 2. Earlier Criticisms: The Journey from Mechanisms C and D to E

### 2.1 Summary of Mechanism D Failures Addressed by E
The detailed critique of Mechanism D lives in [03-mechanism-d-critique.md](/docs/research/top-candidates/03-mechanism-d-critique.md) (Section 4). In brief, E responds to D's four failure modes as follows:

| Mechanism D Failure Mode ([03 Section 4](/docs/research/top-candidates/03-mechanism-d-critique.md)) | Mechanism E Response | Status in E |
|---|---|---|
| **4.1 Context-blind fact dropping**: compressing 400–700 tokens of claim-bearing prose into a ~100-token role summary drops 70–80% of content blind to future jobs/pools | Replace 1-line role summarization with per-claim propositional de-noising (~150–200 tokens elastic), keeping every concrete claim tuple while stripping grammatical scaffolding and generic duty filler | **Open hypothesis** (Section 3.2; tested in [05-test-bench.md](/docs/research/top-candidates/05-test-bench.md), Experiments 1 & 5) |
| **4.2 Laundering `syntactic_tier`**: free-text summarization rewrites passive exposure (`peripheral_action`) into active-sounding prose | Extract explicit `claim_tier` and per-skill `syntactic_tier` tags and render them directly in the digest (`[c1:action]` vs. `[c5:peripheral]`) | **Addressed in schema** (Section 4.1) |
| **4.3 Low query-time fact density per token**: prose spends 30–40% of query tokens on grammatical glue | Serialize compact pointer tuples in TypeScript for the query prompt; extraction output token overhead is higher than D's (see Section 2.3) | **Query density addressed; extraction cost traded off** (Section 2.3) |
| **4.4 Stage 2 citation tunnel vision & single-score noise**: hydrating only Stage 1 cited claims misses secondary evidence; composite axis sums recreate black-box scores | Use emergent axes strictly as a shared yardstick and explanation layer; hydrate full CVs + all claims for the final 8 contenders | **Addressed in Section 6** |

### 2.2 Carried-Over Criticism 1: Positional Bias & Grouping Risk (Addressed via Reshuffled Halving)
- **Origin**: Putting 40–80 candidates in one prompt suffers from middle-of-prompt attention drop-off ([02-mechanism-c-critique.md](/docs/research/top-candidates/02-mechanism-c-critique.md), Section 4). Conversely, splitting into small groups of 8 and picking 1–2 per group fails if all top contenders land in the same group.
- **How E solves both**:
  1. **The Grouping Rule**: Only cut a candidate if at least 3 people in their own group beat them. Since at most 2 candidates in the entire pool are better than a true Top 3 contender, keeping the **best 4 out of 8** guarantees no unlucky grouping can eliminate a Top 3 contender.
  2. **Order Cancellation**: Each group of 8 is evaluated in both forward and reversed order, keeping the 4 with the best average rank, then reshuffled before the next halving round.
  3. **Balanced Final Round**: Once down to ~8 finalists, E ranks them across 4 Latin-square orderings (each sits early, middle, and late equally often) and settles the top 5 with bidirectional pairwise comparisons (A-vs-B and B-vs-A).

### 2.3 Carried-Over Criticism 2: Token Cost at Extraction Time vs. Query Time (Status: Trade-Off, Unmeasured)
Cost has to be split into two separate token streams:

| | Query time (what the ranking LLM reads) | Extraction time (what the ingestion LLM writes) |
|---|---|---|
| **Mechanism D** | ~100 tokens of prose capsule per candidate | ~100 extra output tokens per CV |
| **Mechanism E** | ~150–200 token digest per candidate, serialized in code | Every claim written out as a structured JSON object |

- **Query time (E benefits)**: The digest is assembled in TypeScript from stored JSONB, with no LLM call. It is denser than prose (`[c1:action] Go, gRPC -> architected order routing | 18k rps`), and 40–80 digests fit in ~8k–12k tokens instead of 120k+ tokens of raw CVs. The "prose wastes tokens on grammar" argument ([03 Section 4.3](/docs/research/top-candidates/03-mechanism-d-critique.md)) applies here, and here E wins.
- **Extraction time (E adds overhead)**: The digest can only be built if the extraction LLM first **outputs** every field. A rough per-claim estimate:

  ```text
  {"claim_id":"c1","source_entry_ref":"work_1","claim_tier":"action_attributed",          ~25  (keys, structure)
   "skills":[{"skill":"Go","syntactic_tier":"action_attributed","canonical_skill":"go"}],  ~20
   "raw_nouns":["gRPC","Kafka","order-routing microservices"],                            ~10
   "compact_action":"architected order-routing microservices",                            ~10
   "outcome_attached":"18k rps, -44% p99",                                                 ~8
   "evidence_span":"Architected order-routing microservices in Go and gRPC ..."}          ~30
  ```

  This is roughly 100 output tokens per claim, or ~1,500 for 15 claims. The current `skills_demonstrated` aspect already pays for part of this, so the realistic increase is roughly **+500 to +1,500 output tokens per CV**, compared with the ~100 used to reject D. JSON keys, quotes, and braces are their own scaffolding overhead, the same kind of waste held against prose in [03 Section 4.3](/docs/research/top-candidates/03-mechanism-d-critique.md). Output tokens also dominate per-CV extraction latency.
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
   - In Mechanism E, 80 candidates serialized into dense factual propositions require ~12,000 tokens. This removes the upload limit and reduces query-time tokens, but it does not remove positional bias across 40–80 candidates in one prompt (Section 2.2).

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
     - ~450 tokens of grammatical scaffolding (*"Was responsible for leading the development of..."* = 8 tokens to express an active ownership predicate) wrapped around the 400–700 tokens of claim-bearing sentences noted in [03 Section 4.1](/docs/research/top-candidates/03-mechanism-d-critique.md).
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

At query time, TypeScript compiles the candidate profile into a compact, pointer-backed digest at **$0 marginal compute cost** (the extraction-time cost of producing these fields is covered in Section 2.3):

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

## 6. Query-Time Funnel: Axis Discovery, Reshuffled Halving & Balanced Finale

Instead of asking a single prompt to shortlist 20 out of 60 (which loses middle-of-prompt candidates) or summing noisy per-axis scores into a black-box rank, Mechanism E splits discovery, recall halving, and final ranking:

```text
Stage 0: Deterministic Gatekeeper ($0, TypeScript) -> ~60 Viable Contenders
  │
  ├─► Stage 1: Pool-Wide Axis Discovery (~8k-12k tokens, 1 LLM call)
  │     Input:  Job Spec + All Viable Digests
  │     Output: 3-5 Emergent Axes + Pool Summary (used as a shared yardstick, not a score sum)
  │
  ├─► Stage 2: Reshuffled Halving Rounds (60 -> 30 -> 15 -> 8, parallel group calls)
  │     Rule:   Shuffle into groups of ~8 -> evaluate forward & reversed -> keep best 4 per group
  │     Safety: At most 2 candidates in the pool beat a true Top 3 contender; keeping 4/8 guarantees survival
  │
  └─► Stage 3: Final Round on 8 Finalists (Full CVs + Tier-Tagged Claims)
        Step A: Rank all 8 across 4 Latin-square orderings (early/middle/late balanced) -> Top 5 by avg rank
        Step B: Bidirectional pairwise (A-vs-B and B-vs-A, 20 small calls) on Top 5; order-flips count as ties
        Output: Confident or Contested Top 3 + cited claim_ids hydrated to verbatim quotes in O(1)
```

### 6.1 Stage 1: Emergent Axes as a Shared Yardstick (Not a Composite Score)
Stage 1 reads all viable digests once to discover 3–5 pool-relative differentiating axes and a pool distribution summary. Axes serve as a **consistent evaluation yardstick across groups** and **human-readable explanations/filters**, avoiding arbitrary `strong=2, moderate=1` composite sums.

### 6.2 Stage 2: Reshuffled Halving Rounds (Why Grouping Cannot Drop a Top 3 Contender)
- **The Grouping Rule**: Only cut a candidate if at least 3 people in their own group beat them. Even if all 3 true top candidates land in the same group of 8 alongside #4 and #5, keeping the **best 4 of 8** advances all 3 top contenders.
- **Inside Each Group**: The prompt passes the Job Spec, the discovered axes (plus an *"outside-the-axes standout"* escape hatch for unusual spikes), and ~8 digests, asking for the best 4 with cited `claim_id`s.
- **Forward + Reversed Passes & Reshuffling**: Every group runs twice (original and reversed order) and keeps the 4 with the best average rank, cancelling first/last slot bias. Survivors reshuffle into new groups each round (`60 -> 30 -> 15 -> 8`).

### 6.3 Stage 3: Full-CV Finale & Confident vs. Contested Top 3
With only ~8 finalists left, the pipeline reloads **full raw CV text alongside tier-tagged claims** (~12k tokens), eliminating any digest compression loss on the final decision while `[action]`/`[peripheral]` tags still block inflated rhetoric:
1. **Latin-Square Permutations**: Rank all 8 across 4 balanced orderings so every finalist sits in the first, middle, and last third equally often; take the top 5 by average rank.
2. **Bidirectional Pairwise Verification**: Compare all 10 pairs among the top 5 in both orders (`A vs B` and `B vs A`). If a verdict flips when order flips, record a tie.
3. **Confident vs. Contested Output**: If #3 and #4 split comparisons, surface both rather than forcing a noisy tie-break (*"Top 2 clear; #3 contested between X [c2] and Y [c4]"*), hydrating cited `claim_id`s directly from PostgreSQL JSONB at zero quote-generation cost.

---

## 7. Comparison Across Iterations

| Capability | Mechanism C (Micro-Digest) | Mechanism D (Prose Capsule) | Mechanism E (Pointer Aspect Digest) |
|---|---|---|---|
| **Digest Token Budget** | ~60 tokens | ~100 tokens (prose) | ~150–200 tokens (elastic) |
| **Ingestion Extraction Mode** | Closed-world canonical skills | Open-world prose summarization | Open-world factual propositional de-noising |
| **Syntactic Tier Integrity** | Preserved | Risk of paraphrasing laundering | Preserved per claim and per skill |
| **Non-Work Outlier Capture** | Dropped | Captured in prose | Captured via open `context_label` + outside-axes flag |
| **Emergent Axis Role** | None (Single pass) | Coupled with 1-shot Top 20 | Shared yardstick + pool explanation |
| **Positional Bias Mitigation** | None (1-pass over 80) | None in Stage 1 | Reshuffled 4-of-8 halving + forward/reverse orders |
| **Finalist Evidence Scope** | Digest only | Selective cited claims | Full raw CV + all tier-tagged claims on final 8 |
| **Top 3 Resolution** | Forced single-shot rank | Forced single-shot rank | Latin-square + bidirectional pairwise (Confident/Contested) |
| **Quote Grounding** | Re-extracted or truncated | Paraphrased | $O(1)$ JSONB pointer resolution |
