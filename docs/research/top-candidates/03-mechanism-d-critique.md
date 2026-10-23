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

## 2. What Mechanism D Contributed (And What Remained Open)

Mechanism D introduced two query-time design ideas that carry forward into subsequent iterations:

1. **Two-Stage In-Context Funnel**:
   - Instead of asking one prompt to evaluate 80 candidates and emit a final Top 10 in a single step, Stage 1 acts as a **broad shortlist filter** (40–80 down to 20), and Stage 2 performs **deep comparative ranking** on the 20 finalists.
   - Separating shortlisting from final ranking reduces the reasoning load on the final comparison pass while keeping query token usage around ~11,000 tokens ($\approx \$0.002$). However, because Stage 1 still reads all 40–80 candidates in a single pass, positional attention bias ("lost in the middle") in Stage 1 is not eliminated and remains an open question (see [04-mechanism-e-pointer-aspect-spec.md](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md), Section 2.2).

2. **Explicit Emergent Axis Discovery (Addressing the Black-Box Problem)**:
   - In Stage 1, the LLM surfaces the **3 to 5 pool-relative emergent differentiators** that define the top tier in *this specific pool for this specific job* (e.g., *"1. Verified >5k rps Go concurrency (5/62 candidates); 2. Payment ledger reconciliation depth (4/62 candidates); 3. Rapid internal promotion to Senior/Lead (7/62 candidates)"*).
   - Presenting these axes in the UI exposes *why* candidates rose to the top instead of returning an opaque ranking.

---

## 3. Scope & Clarification: Disregarding Strawman Points

Before evaluating the valid failure modes of the free-text capsule, two strawmen must be explicitly set aside:
1. **"60 Tokens Was Just a Compression Bottleneck"**: The core failure of Mechanism C was not merely token count. Expanding a representation to 150 tokens while remaining restricted to the original 7 aspects still fails if the schema itself drops non-skill claims and outlier spikes.
2. **"Confusing Canonical Normalization with Aspect Extraction"**: Our critique of Mechanism C was never about `canonicalSkills.ts` synonym mappings. The fundamental issue was the **aspect schema boundary**: in [`skillsDemonstrated.ts`](/src/entities/extraction/candidate/aspects/skillsDemonstrated.ts), an evidence span is extracted *only* when anchored to a technical tool keyword. High-impact engineering leadership, promotion velocity, and non-work spikes (OSS, hackathons, publications) have no schema representation and were dropped during one-time extraction.

What remains valid and decisive is the adversarial critique of **generating free-text natural-language summaries at ingestion time**.

---

## 4. Adversarial Critique: Why Mechanism D Fails

Mechanism D's failures sit in two places: its **ingestion representation** (compressing a resume into ~100 tokens of free-text role summaries) and its **underspecified Stage 2 handoff**.

### 4.1 Failure Mode 1: Context-Blind Fact Dropping at Ingestion Time
- **The Token Reality**: A typical 2-page engineering resume contains **400 to 700 tokens of claim-bearing sentences** across 3–5 roles, 15–25 bullet points, and projects—not "1,350 tokens of formatting noise and 100 tokens of facts."
- **The 70–80% Drop**: Compressing those 400–700 tokens into a "1-line factual distillation per role (~100 tokens)" at **ingestion time** forces the ingestion LLM to discard **70% to 80% of that content**.
- **Context-Blind Prior**: Ingestion occurs on one CV in a complete vacuum, blind to future jobs and peer applicant pools. The isolated LLM must rely on a generic resume-salience prior (keeping headline team sizes or generic `%` metrics while dropping niche domain or architectural details like *"built ISO-8583 ATM switch parser"* or *"idempotent JazzCash webhook reconciliation"*). If that dropped detail turns out to be the emergent differentiator in a future fintech role, the capsule permanently lost it at upload time.

### 4.2 Failure Mode 2: Laundering `syntactic_tier` (Breaking Hireflow's Core Moat)
Hireflow's primary competitive moat is separating proven ownership from passive exposure:
- `action_attributed`: Candidate was the grammatical subject of an ownership verb (*"Architected X"*).
- `peripheral_action`: Candidate had passive or team-level exposure (*"Part of the department that worked on X"*).
- `context_listed`: Bare tool listed without proof.

When an LLM writes dense 1-line telegraphic prose, it naturally **paraphrases and compacts** text. In doing so, LLMs routinely **rewrite passive participation into active-sounding phrasing** (*"Assisted team with settlement microservice"* becomes *"Handled settlement microservices"*). Free-text prose capsules launder keyword-stuffer claims into top-tier summaries, undermining Hireflow's anti-inflation verification engine during Stage 1 shortlisting.

### 4.3 Failure Mode 3: Lower Query-Time Fact Density + Extra Ingestion Output Tokens
- **Prose Overhead at Query Time**: Natural language prose spends 30% to 40% of its token budget on grammatical scaffolding, pronouns, articles, and connective verbs rather than factual propositions.
- **Ingestion Output Token Overhead**: Generating a separate prose capsule alongside the 7 JSONB aspects adds ~100 LLM generation output tokens to every uploaded resume to produce a lossy summary.

### 4.4 Failure Mode 4: Citation Tunnel Vision and Static Axis Display in Stage 2
- **Citation Tunnel Vision**: If Stage 2 only hydrates fuller evidence for the 1–2 highlights that Stage 1 cited when shortlisting a candidate, it introduces confirmation bias. When Stage 2 compares the 20 finalists across secondary emergent axes, uncited accomplishments remain unhydrated or omitted.
- **Static Axis Display Trap**: Emitting only a monolithic Top 10 list in Stage 2 makes the discovered emergent axes in the UI decorative. A recruiter cannot toggle or drop an irrelevant axis to re-rank the finalists without triggering another LLM call.

---

## 5. Architectural Conclusion

Mechanism D's **query-time structure**—a Two-Stage Discovery Funnel that surfaces explicit pool-relative Emergent Axes in Stage 1 and ranks finalists in Stage 2—is worth keeping, although its Stage 1 positional sensitivity remains to be measured.

Mechanism D's **ingestion representation** (a ~100-token free-text prose summary) and **selective Stage 2 handoff** fail and are replaced in [04-mechanism-e-pointer-aspect-spec.md](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md).
