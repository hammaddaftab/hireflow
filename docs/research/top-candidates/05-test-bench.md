# Test Bench: Validating Mechanism E Against the Open Questions

## 1. Why This Document Exists (Where We Are Stuck)

Mechanisms A through E were each rejected or adopted by argument, using hand-picked examples. None was measured. The iteration has converged on an architecture *shape*, but the remaining questions cannot be settled by more argument. Each new mechanism re-estimated the same quantities (fact budget per CV, attention limits, token cost) to suit itself, which is how the debate kept looping.

The core bet behind [Mechanism E](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md):

> Extract each CV **alone**, before any job exists. Rank with **the pool and the job** in context. The result should match a ranker that reads every full CV.

The bench turns that bet into measurements.

### 1.1 Settled vs. Open

| Settled (do not reopen) | Open (measure here) |
|---|---|
| Knockouts are deterministic; excellence is judged in context | **Loop (a):** how much pool-blind extraction drops |
| Candidate-level joint context is required (Mechanism B's marginal collapse) | Fact budget per CV: 150–200 tokens or 400–700 tokens |
| Axis discovery is separate from final ranking | Stage 1 attention drop-off across 40–80 candidates |
| Claim *grammar* is bounded, claim *values* stay open (resolves loop (b)) | Real extraction-time vs. query-time token cost |
| Trajectory and tenure math in code; quotes via pointer | Oracle reliability (the ceiling on any agreement target) |
| | Anticipated vs. genuinely emergent signal capture |
| | Validity of $0 axis-toggle re-ranking over a fixed shortlist |

### 1.2 The Specific Contradictions This Bench Must Resolve
- **Fact budget**: [04 Section 2.1](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md) rejects D because a CV holds 400–700 tokens of substantive facts. [04 Section 3.2](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md) defends E because a CV holds only ~150–200 tokens of unique facts. Both cannot be true.
- **Attention**: C was rejected for positional bias at ~4.8k tokens and 80 items. E's Stage 1 places the same item count in ~8k–12k tokens ([04 Section 2.5](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md)).
- **Cost**: D was penalised for ~100 extra extraction output tokens. E likely adds +500 to +1,500 ([04 Section 2.6](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md)).
- **Benchmark circularity**: the pool proposed in [IDEA_AND_RESEARCH.md](/docs/IDEA_AND_RESEARCH.md) Section 5.3 is seeded with the same five signals (Section 5.1) that E's schema was designed to capture. A high score would only show that E catches what it was built to catch.

---

## 2. Open Questions Mapped to Experiments

| # | Open question | Experiment(s) | Needs oracle? |
|---|---|---|---|
| Q1 | Does pool-blind extraction drop decisive facts? (loop (a)) | Exp 1, Exp 5 | Exp 1: no; Exp 5: yes |
| Q2 | What is the real fact budget per CV? | Exp 1 | No |
| Q3 | Is Stage 1 recall position-dependent? | Exp 3 | No |
| Q4 | What does E actually cost, per stream? | Exp 4 | No |
| Q5 | How reliable is the oracle itself? | Exp 2 | Yes |
| Q6 | Does E capture unanticipated signals, or only the five it was designed for? | Exp 5 + Exp 6 | Yes |
| Q7 | Is axis-toggle re-ranking valid over a 20-candidate shortlist? | Exp 7 | No |

---

## 3. Shared Fixtures

### 3.1 CV Pool (40–50 CVs)
The pool is split by who authored the differentiators:

| Group | Share | Contents | Authored by |
|---|---|---|---|
| **Anticipated** | ~40% | Signals from IDEA Section 5.1: Big Tech/Careem alumni, high-scale builders, fast promotion, domain adjacency, ICPC/OSS spikes | Design team (allowed) |
| **Held-out** | ~40% | Differentiators that appear in **none** of the design docs | Independent author |
| **Negatives** | ~20% | Passive keyword stuffers, internally contradictory claims, filler-heavy CVs | Either |

**Held-out rules:**
- The independent author does not read `/docs/research/top-candidates/` before writing.
- Each planted differentiator is recorded in a **sealed answer key**: CV ID, the exact sentence, and which job it is meant to win.
- Whoever tunes extraction prompts never sees the answer key until all runs are complete.
- Differentiators are planted as **one bullet inside an otherwise ordinary role**, never as a headline. Burying them is what tests extraction loss.

**Example held-out differentiators** (illustrative only; the real ones must come from the independent author):
- Automated State Bank regulatory returns for a microfinance bank
- Sole engineer at a 4-person company, owning the full stack and operations
- Former chartered accountant now applying for a ledger engineering role
- Owned on-call rotation and wrote incident post-mortems
- Built an Urdu speech-to-text pipeline
- Migrated a legacy Oracle database to PostgreSQL with zero downtime

### 3.2 Job Specs (3–4 jobs over the same pool)
Each job is written so that a **different planted differentiator** should decide the top of the ranking. At least two jobs must be decided by **held-out** differentiators.

| Job | Intended decisive signal | Signal group |
|---|---|---|
| J1: Backend engineer for a company moving off Oracle | Oracle-to-Postgres migration | Held-out |
| J2: Fintech compliance backend | State Bank regulatory automation | Held-out |
| J3: High-scale Go platform | 18k rps Go services | Anticipated |
| J4: Voice AI startup | Urdu speech pipeline | Held-out |

### 3.3 Oracle
- Reads the **full raw CVs**.
- Pairwise tournament with randomised candidate order per comparison.
- **Human adjudication** of every case where the oracle and E disagree, not only the oracle's Top 10. This matters because raw-CV LLMs are themselves susceptible to inflated rhetoric ([04 Section 3.1](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md)). Without adjudication, E is penalised every time it correctly demotes an inflated CV.
- The oracle also outputs, per Top 10 candidate, the **decisive reason** they beat the runners-up (used in Exp 6).

### 3.4 Systems Under Test
- **E (as specified)**: Stage 0, then Stage 1 (axes + Top 20), then Stage 2 (per-axis matrix + Top 10).
- **Baselines**: the ablations in IDEA Section 5.3 (A, B, naive 60-token digest, prose capsule).
- **Drag-and-drop baseline**: all raw CVs in one prompt, single question "who are the top 10 and why". This is the real competitor ([04 Section 3.1](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md)).

---

## 4. Experiments

### Experiment 1: Extraction Recall Audit (Resolves Q1, Q2; No Oracle Needed)
**Goal**: Measure directly how much one-at-a-time extraction drops, independent of any ranking.

**Procedure**:
1. Take 15–20 CVs from the pool, including all CVs with held-out plants.
2. An annotator (human, or an LLM given the raw CV and checked by a human) marks every **concrete claim**: proper nouns, systems, architectures, domain workflows, metrics, awards, organisational context.
3. Run E's extraction on the same CVs.
4. Match each annotated claim to an extracted `ExtractedRoleClaim` or `ExtractedNotableSignal`.

**Metrics**:
- Overall claim recall: annotated claims present in the extraction / all annotated claims.
- **Held-out plant recall**: planted sentences present in the extraction / all planted sentences.
- Recall by category (work claims, non-work spikes, organisational context, education depth).
- Token counts per CV: raw text, annotated fact tokens, serialized digest tokens. This settles the 150–200 vs. 400–700 contradiction.
- A separate tally of claims that are **structurally outside the tuple shape** (implausibility across claims, filler density as a negative signal, company stage or size). These are expected misses by design and are reported, not counted as extractor errors.

**Proposed thresholds** (to be agreed before running): held-out plant recall >= 95%; overall claim recall >= 90%.

### Experiment 2: Oracle Noise Floor (Resolves Q5)
**Goal**: Know the ceiling before setting a target.

**Procedure**: Run the oracle 3 times per job with different candidate orderings and seeds.

**Metrics**: Top 10 overlap between oracle runs (Recall@10 of run B against run A, averaged over pairs).

**Interpretation**: If two oracle runs agree on only 80% of their Top 10, a 90% agreement target for E is unreachable by construction. Restate E's target relative to this floor (e.g., "E-to-oracle agreement within 5 points of oracle-to-oracle agreement").

### Experiment 3: Stage 1 Positional Sensitivity (Resolves Q3)
**Goal**: Determine whether "lost in the middle" affects Stage 1 at 8k–12k tokens.

**Procedure**:
1. For a fixed job and pool, run Stage 1 on 5 shuffled candidate orderings.
2. In additional runs, deliberately place 3–5 known-strong candidates (from the answer key) in the **middle third** of the prompt.

**Metrics**:
- Pairwise overlap of the Top 20 shortlists across shuffles.
- Inclusion rate of each known-strong candidate by position bin (first, middle, last third).
- Stability of the discovered axes across shuffles (same axes, same count).

**Pass condition**: known-strong candidates are included at the same rate regardless of position bin, and shortlist overlap is high.

**Variants to compare if it fails** (all unvalidated):
- Shuffled multi-run voting (union or majority across 3 Stage 1 runs).
- Chunked Stage 1: split the pool into 3–4 chunks, shortlist per chunk, merge axes.
- Discovery/scoring split: one pool-wide call discovers axes only, then each candidate is scored against the fixed axes in isolation or small batches. Pool-wide context is used only for discovery.

### Experiment 4: Token Cost and Latency per Stream (Resolves Q4)
**Goal**: Replace estimates with measured numbers, kept as two separate streams.

**Procedure**: Run the current extraction and E's extraction on the same 20 CVs. Also run the `evidence_span`-as-offsets variant ([04 Section 2.6](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md)).

**Metrics**:

| Stream | Measure |
|---|---|
| Extraction time | Input tokens, output tokens, latency, and cost per 1,000 CVs, for each variant |
| Query time | Total tokens for Stage 1 + Stage 2 for one job, vs. the drag-and-drop baseline |

**No pass/fail.** This is an input to pricing ([IDEA_AND_RESEARCH.md](/docs/IDEA_AND_RESEARCH.md) Section 6.2). Report both streams side by side and never net them into a single "savings" figure.

### Experiment 5: Same CVs, Different Jobs (Resolves Q1, Q6)
**Goal**: The most direct test of "isolated extraction, pool-aware ranking."

**Reasoning**: Extraction runs once, before any job exists, and the stored digests never change. If the digests keep everything that matters, E's top picks should **move with the job** in the same way the oracle's do.

**Procedure**: For each job in Section 3.2, produce the oracle Top 10 and E's Top 10 over the same pool.

**Example of the expected pattern**:

| Job | Oracle top pick | E top pick if extraction is sound | E top pick if the Oracle bullet was dropped |
|---|---|---|---|
| J1 | Ayesha (Oracle migration) | Ayesha | Someone else (miss) |
| J2 | Sara (State Bank automation) | Sara | Sara |
| J3 | Hamza (18k rps Go) | Hamza | Hamza |
| J4 | Bilal (Urdu speech) | Bilal | Bilal |

**Metrics**:
- Per-job Recall@10 and NDCG@10 of E against the oracle.
- **Shift agreement**: for each pair of jobs, which candidates entered or left the Top 10 for the oracle, and whether E shows the same moves.

**Error diagnosis** (aligned with IDEA Section 5.3 step 4): for every miss, check whether the decisive fact is in E's digest.
- **Not in the digest**: extraction miss. This is loop (a) and the most important finding.
- **In the digest but not used**: ranking miss, attributable to Stage 1 or Stage 2.

### Experiment 6: Anticipated vs. Unanticipated Recall (Resolves Q6; Reporting Layer over Exp 5)
**Procedure**: Tag every decisive reason the oracle gave (Section 3.3) as **anticipated** (listed in IDEA Section 5.1) or **unanticipated**. Report E's recall separately for each group.

**Interpretation**:

| Anticipated recall | Unanticipated recall | Meaning |
|---|---|---|
| High | High | Isolated extraction preserves emergent signals; loop (a) is closed |
| High | Low | Extraction is biased toward what the designers expected; loop (a) is still open |
| Low | Any | Ranking or extraction is broken on basics; fix before anything else |

### Experiment 7: Axis-Toggle Staleness (Resolves Q7; Secondary)
**Goal**: Check whether $0 re-ranking over the 20 Stage 1 finalists stays valid when an axis is removed.

**Procedure**: For each discovered axis:
1. Remove it and re-rank the 20 finalists in code (the UI behaviour).
2. Re-run Stage 1 and Stage 2 without that axis over the full viable pool.

**Metric**: how many candidates in the re-run Top 10 were **outside** the original 20 finalists.

**Interpretation**: if this is often non-zero, the toggle re-ranks a set that the toggle itself has made stale. Possible fix: a per-axis matrix over all viable candidates (see the discovery/scoring split in Exp 3).

---

## 5. Decision Rules

| Outcome | Conclusion | Next action |
|---|---|---|
| Exp 1 held-out recall high, Exp 6 unanticipated recall high | E's extraction premise holds | Proceed to productionise E |
| Exp 1 held-out recall low | Extraction is selecting, not de-noising | Revise extraction prompt or schema; re-run Exp 1 before anything else |
| Exp 1 high, Exp 5/6 low on held-out jobs | Facts survive extraction but ranking ignores them | Investigate Stage 1 (Exp 3) and Stage 2 prompts |
| Exp 3 shows position-dependent inclusion | Attention drop-off is real at this size | Adopt one of the Exp 3 variants and re-run |
| Exp 2 oracle self-agreement < 90% | The 90% target is ill-posed | Restate the target relative to the noise floor |
| Exp 7 frequently non-zero | Toggle re-ranking is misleading | Extend the per-axis matrix to all viable candidates |

---

## 6. Run Order

1. **Exp 1 and Exp 2** first. They are cheap, independent, and gate everything else. If Exp 1 fails, later experiments measure a broken extractor.
2. **Exp 3 and Exp 4**. No oracle dependency beyond the answer key.
3. **Exp 5 with Exp 6**. The main result; requires the oracle and adjudication.
4. **Exp 7**. Only if Exp 5 passes.

---

## 7. Out of Scope
- **Paraphrase laundering in `compact_action`** (passive work reworded as active) is deliberately excluded from this bench.
- This is a research evaluation run manually against a fixed pool. It is not an automated test suite and does not add tests to the codebase.
