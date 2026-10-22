# Detailed Proposal & Critique: Mechanism D (Evidence Capsules & Two-Stage Discovery)

## 1. Mechanism D Proposal Recap

Mechanism D was developed to solve the schema-boundary trap and black-box problems identified in Mechanism C. It proposed splitting the solution into an **open-ended ingestion representation** and a **two-stage comparative query funnel**:

```text
[INGESTION: Parse-Once]
Raw CV (1,500 tok) ──> 1. Closed-World Aspects (7 JSONB aspects for $0 deterministic knockout gates)
                   ──> 2. Open-World Evidence Capsule (~100 tok natural language factual distillation)

[QUERY TIME: "Top Candidates" Funnel]
200 CVs in Pool
  │
  ├─► Stage 0: Deterministic Gatekeeper ($0, 0 tokens)
  │     Filter out hard `contradicted` dealbreakers
  │     ──> ~40–80 Viable Contenders
  │
  ├─► Stage 1: In-Context Pool Discovery & Shortlisting (~6k tokens, 1 LLM call)
  │     Input: Job Spec + All 40–80 Evidence Capsules in context together
  │     Output: (a) 3–5 Emergent Differentiating Axes discovered in THIS pool for THIS job
  │             (b) Top 20 Shortlist
  │
  └─► Stage 2: Deep Comparative Tournament (~5k tokens, 1 LLM call)
        Input: Job Spec + Emergent Axes + Top 20 Candidates with fuller evidence
        Output: Final Top 10 ranked with comparative justifications and verbatim quotes
```

---

## 2. What Mechanism D Successfully Solved

Mechanism D introduced two architectural breakthroughs that remain foundational:

1. **Two-Stage In-Context Funnel (Solving "Lost in the Middle")**:
   - Instead of asking one prompt to evaluate 80 candidates and output 10 names, Stage 1 acts as a **high-recall filter** (80 down to 20), and Stage 2 performs **high-precision deep comparison** on the 20 finalists.
   - This eliminates positional attention bias across large applicant pools while keeping query token costs negligible (~11,000 tokens total = $\approx \$0.002$).

2. **Explicit Emergent Axis Discovery (Solving the Black-Box Problem)**:
   - In Stage 1, the LLM first surfaces the **3 to 5 pool-relative emergent differentiators** that define the top tier in *this specific pool for this specific job* (e.g., *"1. Verified >5k rps Go concurrency (5/62 candidates); 2. Payment ledger reconciliation depth (4/62 candidates); 3. Rapid internal promotion to Senior/Lead (7/62 candidates)"*).
   - The UI presents these axes directly to the recruiter. Instead of an opaque AI rank, the recruiter sees why candidates rose to the top and can inspect or adjust the weighting criteria.

---

## 3. Scope & Clarification: Disregarding Strawman Points

Before evaluating the valid failure modes of the free-text capsule, two strawmen must be explicitly set aside:
1. **"60 Tokens Was Just a Compression Bottleneck"**: The core failure of Mechanism C was not merely token count. Expanding a representation to 150 tokens while remaining restricted to the original 7 aspects still fails if the schema itself drops non-skill claims and outlier spikes.
2. **"Confusing Canonical Normalization with Aspect Extraction"**: Our critique of Mechanism C was never about `canonicalSkills.ts` synonym mappings. The fundamental issue was the **aspect schema boundary**: in [`skillsDemonstrated.ts`](/src/entities/extraction/candidate/aspects/skillsDemonstrated.ts), an evidence span is extracted *only* when anchored to a technical tool keyword. High-impact engineering leadership, promotion velocity, and non-work spikes (OSS, hackathons, publications) have no schema representation and were dropped during one-time extraction.

What remains valid and decisive is the adversarial critique of **generating free-text natural-language summaries at ingestion time**.

---

## 4. Adversarial Critique: Why the Free-Text "Open-World Evidence Capsule" Fails

At a 150-token budget, an ingestion-generated free-text capsule (~100 tokens of 1-line role summaries) fails to outperform properly serialized extracted aspects, and on several critical dimensions is strictly worse.

### 4.1 Failure Mode 1: Context-Blind Fact Dropping at Ingestion Time
- **The Token Reality**: A typical 2-page engineering resume contains **400 to 700 tokens of substantive factual claims** across 3–5 roles, 15–25 bullet points, and projects—not "1,350 tokens of formatting noise and 100 tokens of facts."
- **The 70–80% Drop**: Compressing 500 tokens of factual claims into a "1-line factual distillation per role (~100 tokens)" at **ingestion time** forces the ingestion LLM to drop **70% to 80% of the candidate's factual claims**.
- **Context-Blind Prior**: Ingestion occurs on one CV in a complete vacuum, blind to future jobs and peer applicant pools. The isolated LLM must rely on a generic resume-salience prior (keeping headline team sizes or generic `%` metrics while dropping niche domain/architectural details like *"built ISO-8583 ATM switch parser"* or *"idempotent JazzCash webhook reconciliation"*). If that dropped detail is the emergent differentiator in a future fintech role, the capsule permanently lost it at upload time.

### 4.2 Failure Mode 2: Laundering `syntactic_tier` (Breaking Hireflow's Core Moat)
Hireflow's #1 competitive moat (Section 2.2, Section 6.1) is separating proven ownership from passive exposure:
- `action_attributed`: Candidate was the grammatical subject of an ownership verb (*"Architected X"*).
- `peripheral_action`: Candidate had passive or team-level exposure (*"Part of the department that worked on X"*).
- `context_listed`: Bare tool listed without proof.

When an LLM writes dense 1-line telegraphic prose, it naturally **paraphrases and compacts** text. In doing so, LLMs routinely **launder passive participation into active prose** to save words—turning a keyword-stuffer's peripheral exposure into a strong-sounding 1-line active claim. This directly undermines Hireflow's anti-inflation verification engine during Stage 1 shortlisting.

### 4.3 Failure Mode 3: Lower Fact Density per Token + Redundant Ingestion Cost
- **Prose Overhead**: Natural language prose wastes 30% to 40% of its token budget on grammatical glue, articles, and connective verbs.
- **Output Token Cost**: Generating a separate prose capsule alongside the 7 JSONB aspects increases LLM generation output tokens (the most expensive tokens) on every resume upload.

---

## 5. Head-to-Head at 150 Tokens: Serialized Aspects vs. Free-Text Capsule

Comparing what fits in 150 tokens of structured aspect serialization versus 150 tokens of free-text prose capsule:

| Dimension | 150-Token Free-Text Capsule (Mechanism D) | 150-Token Serialized Aspects | Winner |
|---|---|---|---|
| **Information Density** | ~8–10 factual clauses (prose overhead) | ~14–18 discrete structured facts + micro-spans | **150-Token Aspects** |
| **Anti-Inflation (`syntactic_tier`)** | Lost/blurred by LLM paraphrasing | Explicitly preserved (`[action]` vs `[peripheral]`) | **150-Token Aspects** |
| **Career Trajectory & Tenure Math** | Inferred loosely from text | Deterministically pre-computed from `work_history` (`Jr->Sr in 2.5y FT`, internships excluded) | **150-Token Aspects** |
| **Ingestion Cost** | Extra output tokens for prose summary | **0 extra ingestion tokens** (serialized in code from stored JSONB aspects) | **150-Token Aspects** |
| **Un-normalized Niche Tech / Domain Terms** | Preserved *only if* the 1-line summary chose them | Preserved directly if raw extracted strings + `evidence_span`s are included before canonical filtering | **Aspects** |

---

## 6. The One Catch: How 150-Token Aspects Must Be Built to Avoid Mechanism A's Trap

There is only one scenario where a free-text capsule would beat a 150-token aspect representation:
- **If you grow aspects from 60 to 150 tokens by adding rigid feature columns** (e.g., adding `employer_tier`, `domain_enum`, `team_size_led`, `system_scale_rps`), you fall right back into **Mechanism A's pre-defined feature trap**.
- Furthermore, under the original schema (Section 2.2), `skills_demonstrated` only extracts an `evidence_span` when anchored to a technical tool keyword. If a bullet says *"Promoted twice in 18 months; owned incident post-mortems for PKR 4B/mo ledger"*, `skills_demonstrated` drops it.

To make a 150-token Extracted Aspect digest strictly dominate the free-text capsule without adding pre-defined feature taxonomies, two targeted adjustments are required:

1. **Generalize `skills_demonstrated` $\rightarrow$ Proven Role Claims (Skill-Anchored + Scope/Impact-Anchored)**:
   - Retain the exact aspect verification structure (`source_entry_ref`, `syntactic_tier`, `outcome_attached`, `evidence_span`), but allow the extractor to emit claims for **high-impact role scope, leadership, and domain achievements** even when no technical tool keyword is present.
   - Add a lightweight `notable_signals` aspect for **non-work outlier spikes** (projects, open-source repositories, competition wins like ICPC/Kaggle, honors).
2. **Serialize the Digest Deterministically in Code (Pre-Canonical Normalization)**:
   - Build the 150-token candidate representation directly in TypeScript from stored aspects—combining deterministic trajectory math (`Careem: SWE -> Sr SWE, 2.8y FT`), education (`NUST BSCS 3.8`), and extracted claims formatted as compact pointer tuples before canonical filtering drops non-catalog terms.

---

## 7. Architectural Conclusion

You do not need a separate LLM-generated "Open-World Evidence Capsule" at ingestion.

The correct architecture combines:
1. **Mechanism D's Query-Time Funnel**: The Two-Stage In-Context Discovery pipeline (Stage 1 Emergent Axis Discovery $\rightarrow$ Stage 2 Comparative Tournament).
2. **Upgraded Aspect Representation (Mechanism E)**: Growing the aspect-based digest to ~150–200 tokens using compact pointer tuples (`[c1:action] raw_nouns -> compact_action | outcome`), retaining raw domain nouns, generalizing role claims, capturing non-work spikes, and preserving `syntactic_tier` with zero ingestion prose overhead.
