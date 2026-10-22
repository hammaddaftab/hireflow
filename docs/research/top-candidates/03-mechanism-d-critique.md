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

## 3. Adversarial Critique: Why the Free-Text "Open-World Evidence Capsule" Fails

While Mechanism D's query-time discovery funnel succeeded, its proposed ingestion representation—the **~100-token free-text prose capsule (1-line factual role distillations)**—breaks down under adversarial examination:

### 3.1 Failure Mode 1: Context-Blind Fact Dropping at Ingestion Time
- **The Token Reality**: A typical 2-page engineering resume contains **400 to 700 tokens of substantive factual claims** across 3–4 roles, 15–25 bullet points, and education/projects.
- **The Drop**: Forcing the ingestion LLM to summarize an entire candidate into a ~100-token natural-language capsule forces it to discard **70% to 80% of the candidate's factual claims**.
- **Context-Blind Prior**: Because ingestion occurs in a vacuum (blind to future jobs and peer applicant pools), the ingestion LLM must use a generic, ungrounded salience heuristic. It will inevitably keep generic metrics (*"improved performance by 25%"*) and drop niche architectural or domain facts (*"implemented idempotency keys for JazzCash webhook processing"*). If a future job specifically needs fintech payment reconciliation, the decisive signal was discarded at ingestion.

### 3.2 Failure Mode 2: Laundering `syntactic_tier` (Breaking Hireflow's Core Moat)
Hireflow's primary competitive advantage (Section 2.2, Section 6.1) is syntactically verifying claims:
- `action_attributed`: Candidate was the active subject of an ownership verb (*"Architected the settlement microservice"*).
- `peripheral_action`: Candidate had passive or team-level exposure (*"Assisted team with settlement microservice updates"*).
- `context_listed`: Bare tool name listed in a role summary without proof.

When an LLM summarizes a resume into telegraphic 1-line prose, it naturally **paraphrases and compacts** text. In doing so, LLMs routinely **rewrite passive involvement into active-sounding phrasing** (*"Assisted with settlement microservice"* becomes *"Handled settlement microservices"*). Free-text prose capsules launder keyword-stuffer claims into top-tier summaries, directly undermining Hireflow's anti-inflation verification engine.

### 3.3 Failure Mode 3: Prose Overhead & Redundant Ingestion Tokens
- **Prose Inefficiency**: Natural language prose requires grammatical glue, pronouns, articles, and connective verbs, wasting 30% to 40% of its token budget on non-information tokens.
- **Output Token Cost**: Generating a prose summary at ingestion adds LLM generation output tokens (the most expensive token category) to every single uploaded CV, increasing ingestion costs without improving structural queryability.

---

## 4. Architectural Conclusion

The two-stage query funnel in Mechanism D (Emergent Axis Discovery $\rightarrow$ Comparative Tournament) is the correct query architecture. 

However, the representation passed into Stage 1 must **not** be an LLM-generated free-text prose summary. It must be a representation that:
1. Retains explicit `syntactic_tier` tags (`action_attributed` vs. `peripheral_action`).
2. Eliminates context-blind fact dropping so all claims survive into Stage 1.
3. Maximizes discrete fact density per token using compact structured notation.
4. Serializes deterministically in code at $0 extra ingestion token cost.
