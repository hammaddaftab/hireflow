# Hireflow — Mechanism E Comparative Benchmark Report (Hackathon Edition)

## 1. Executive Pitch: What We Proved

Recruiters screening 50–300 off-platform resumes face a broken trade-off:
1. **Legacy ATS / Keyword Filters**: Fast and cheap, but collapse candidates into a black-box score and miss emergent excellence signals (research publications, system scale, selective lab pedigree, promotion velocity).
2. **Raw CV Drag-and-Drop into LLMs (`raw` baseline)**: Captures open-world signals, but blows up context windows (~20,000 tokens for just 30 1-page graduate resumes, scaling to 120,000+ on senior CVs), suffers from **positional attention bias ("lost in the middle")**, gets fooled by **passive keyword-stuffing inflation**, and relies on **free-text quote citations** that suffer from cross-candidate contamination (**85.0% citation accuracy in canonical order vs. 100.0% deterministic pointer resolution in Mechanism E** — see [06.1-citation-hydration-audit.md](/docs/research/top-candidates/06.1-citation-hydration-audit.md)).

**Our Approach — Mechanism E ([04-mechanism-e-pointer-aspect-spec.md](/docs/research/top-candidates/04-mechanism-e-pointer-aspect-spec.md))**:
We parse each resume **once at ingestion** into de-noised propositional tuples (`[claim_id:syntactic_tier] raw_nouns -> compact_action | outcome`) linked to verbatim sentences in PostgreSQL JSONB. At query time, TypeScript serializes each candidate into a ~143-token pointer digest at **$0 compute cost** and discovers pool-relative emergent axes across the contender pool.

### Headline Empirical Results (10-CV & 30-CV Benchmarks + Positional Bias Permutation)
1. **5.00x Candidate Context Compression (-80.0% Tokens at $N = 30$)**: Candidate pool tokens dropped from **19,957 tokens** (30 Full Raw CVs) to **3,989 tokens** (30 Mechanism E Digests), cutting total Stage 1 provider tokens by **63.7% (2.76x cheaper)**.
2. **97.4% Claim Retention Under the 200-Token Cap ($N = 30$)**: Across 30 real NUST BSCS graduate resumes (116 extracted claims and non-work spikes), **27 of 30 CVs required zero budget cuts** and **113 / 116 (97.4%)** total claims were retained (median budgeted digest: **143.5 tokens**, max: **198 tokens**), while automatically stripping **18 unanchored filler claims**.
3. **Positional Bias Immunization (8/7/7/8 `inside-out` Permutation Test)**:
   - When the outer 16 CVs (`cand_01..08` + `cand_23..30`) were moved into the middle and the middle 14 CVs (`cand_09..22`) were moved to the outer edges:
   - **Full Raw CVs suffered a 10.5 percentage-point positional citation swing**, **completely lost its `Quantified Model Performance` axis**, and **dropped 100% of citations for `cand_30`** when moved from position #30 to the middle.
   - **Mechanism E maintained a 2.7 percentage-point cohort variance** (`66.7%` vs `64.0%`), **preserved all core technical axes** (including `cand_30`'s multimodal citations in the middle), and achieved **100% (5/5) identical claim citations** on `Quantified Product Impact` across both permutations.
4. **100% Deterministic Pointer Hydration (49/49) vs. Free-Text Quote Citations on Raw CVs (85.0% Canonical / 93.2% Combined)**: Because Raw CVs do not have pre-extracted pointer IDs, `--source raw` cites via **free-text verbatim quotes and paraphrases**, whereas Mechanism E cites via **structured pointers (`[c1]`, `[s1]`)**. Mechanism E hydrated **49 of 49 citations (100.0%)** in $O(1)$ database lookup with **0 warnings**, while Raw Free-Text Quotes achieved **17/20 (85.0%)** in canonical order (suffering from a cross-candidate contamination where `cand_01`'s FIT 2024 conference paper was pasted onto `cand_20`) and **24/24 (100.0%)** in inside-out order (**41/44 or 93.2% combined**). Full citation audit in [06.1-citation-hydration-audit.md](/docs/research/top-candidates/06.1-citation-hydration-audit.md).
5. **Anti-Inflation Smoking Gun**: Mechanism E caught and downgraded an assisted internship claim (`"potentially reducing processing time by 60%"` on `cand_08`) via `[c2:peripheral]`, which fooled the Raw CV baseline into setting `"60% processing-time reduction"` as a top-tier Strong benchmark.
6. **Stage 2 & Stage 3 Top-3 Ranking Tournament — Attention & Positional Bias Audit ([06.2-top3-tournament-attention-and-bias-audit.md](/docs/research/top-candidates/06.2-top3-tournament-attention-and-bias-audit.md))**:
   - **Attention**: Single-pass raw ranking (`raw-single-pass`, ~18.7k tokens) suffered a **Top 3 breakdown (`2/3` overlap, Jaccard `50.0%`)** under `inside-out`, dropping `#3 cand_14` down to `#6` while vaulting bottom-edge `cand_20` (pos #28) into `#3`. Single-pass digest ranking (`digest-single-pass`, all 30 digests in 1 call) fixed the Top 3 (`3/3` overlap) but suffered **mid-rank attention collapse at Ranks #5–#8 (`5/8` overlap, Jaccard `45.5%`)**, dropping the pool's #1 product-impact spike (`cand_11`). Mechanism E's **Stage 2 4-of-8 Halving + Stage 3 Full-CV Finalist Reload** achieved **100% (3/3) core Top 3 convergence** (`cand_25`, `cand_27`, `cand_14`), **80% (4/5) Top 5 overlap**, and **100% (2/2) retention of `cand_11` into the Top 8 finalists**.
   - **Biasedness (Positional Bias)**: Our tournament telemetry proved and canceled positional bias at every layer: **47.8% (44/92)** of Stage 2 within-group evaluations shifted rank when reversed (catching **8 cutoff-boundary `#4 vs #5` flips**), **87.5% (14/16)** of Stage 3A finalist evaluations shifted 1–2 ranks across 4x Latin-Square cyclic permutations, and **25.0% (5/20)** of Stage 3B head-to-head pairwise matchups flipped winners when presentation order reversed — with **100% (5/5) of flipped pairs favoring the second-listed slot (`Candidate B`)**. Bidirectional verification (`A vs B` + `B vs A`) caught all 5 recency flips and surfaced genuine `#3 vs #4` ties as an explicit **`Contested`** boundary rather than guessing.

---

## 2. Scale & Cost Comparison: Full Raw CVs vs. Mechanism E ($N = 10$ and $N = 30$)

Data sourced from:
- 10-CV Benchmarks: [exp1-output](/docs/research/top-candidates/bench/exp1-output/summary.md) & [axes-output](/docs/research/top-candidates/bench/axes-output)
- 30-CV Benchmarks: [exp1-30-output](/docs/research/top-candidates/bench/exp1-30-output/summary.md) & [axes-30-output](/docs/research/top-candidates/bench/axes-30-output)

| Metric | 10 CVs: Raw (`raw-grad-ai-swe`) | 10 CVs: Mechanism E (`exp1-budgeted`) | 30 CVs: Raw (`raw-grad-ai-swe`) | 30 CVs: Mechanism E (`exp1-budgeted`) | 30-CV Improvement (Mechanism E vs. Raw) |
|---|---:|---:|---:|---:|---|
| **Candidate Pool Tokens in Prompt** | 5,836 tokens | 1,197 tokens | 19,957 tokens | **3,989 tokens** | **5.00x smaller (-80.0%)** |
| **Stage 1 API Input Tokens** | 8,365 tokens | 3,353 tokens | 23,930 tokens | **6,909 tokens** | **3.46x smaller (-71.1%)** |
| **Stage 1 Total Provider Tokens** | 11,312 tokens | 5,155 tokens | 26,566 tokens | **9,641 tokens** | **2.76x cheaper (-63.7%)** |
| **Claims Retained (@ 200t Cap)** | N/A | 32 / 32 (100%) | N/A | **113 / 116 (97.4%)** | **27/30 CVs had 0 drops** |
| **Filler Claims Stripped at Ingestion** | 0 (kept in prompt) | 4 stripped | 0 (kept in prompt) | **18 stripped** | **Removes boilerplate noise** |
| **Citation Method** | Free-Text Quotes (no pointers) | Structured Pointers (`[c1]`, `[s1]`) | Free-Text Quotes (no pointers) | **Structured Pointers (`[c1]`, `[s1]`)** | **$O(1)$ ID lookup vs. text search** |
| **Verified Citations (Canonical)** | — | 19 / 19 (100%) | 17 / 20 (85.0% free-text) | **24 / 24 (100.0% $O(1)$ pointer)** | **0 cross-candidate mix-ups** |
| **Verified Citations (Inside-Out)** | — | — | 24 / 24 (100.0% free-text) | **25 / 25 (100.0% $O(1)$ pointer)** | **100% deterministic grounding** |

```mermaid
xychart-beta
    title "30-CV Stage 1 Token Footprint: Full Raw CVs vs. Mechanism E (Lower is Better)"
    x-axis ["Candidate Pool Tokens", "LLM Input Tokens", "Total API Tokens (Canonical)", "Total API Tokens (Inside-Out)"]
    y-axis "Tokens" 0 --> 28000
    bar [19957, 23930, 26566, 26751]
    bar [3989, 6909, 9641, 9730]
```
*(Bar 1: 30 Full Raw CVs | Bar 2: 30 Mechanism E Budgeted Digests)*

---

## 3. Core Research Result: The 8/7/7/8 (`inside-out`) Positional Bias Experiment ($N = 30$)

To test whether serial de-noising into ~143-token pointer digests mitigates the LLM **"Lost in the Middle"** positional bias ([05-test-bench.md](/docs/research/top-candidates/05-test-bench.md), Experiment 3), we ran Stage 1 Axis Discovery on all 30 CVs under two exact orderings in [axes-30-output](/docs/research/top-candidates/bench/axes-30-output):
1. **`canonical` Order (`1..30`)**:
   - **Outer 16 Cohort (Lateral 8/8 Pairs)**: `cand_01..08` at the top edge (positions `1..8`) and `cand_23..30` at the bottom edge (positions `23..30`).
   - **Middle 14 Cohort (Middle 7/7 Pairs)**: `cand_09..15` (positions `9..15`) and `cand_16..22` (positions `16..22`) buried in the middle.
2. **`inside-out` Permuted Order (`[9..15] + [1..8, 23..30] + [16..22]`)**:
   - **Middle 7/7 Pairs Moved to Outer Edges**: `cand_09..15` placed at the top edge (`positions 1..7`) and `cand_16..22` placed at the bottom edge (`positions 24..30`).
   - **Lateral 8/8 Pairs Combined in the Middle**: `cand_01..08` and `cand_23..30` buried together in the middle 16 slots (`positions 8..23`).

### 3.1 Summary of Positional Bias Findings

| Positional Stability Metric ($N = 30$) | Full Raw CVs (`raw` Canonical vs. Inside-Out) | Mechanism E (`exp1-budgeted` Canonical vs. Inside-Out) | Verdict |
|---|---|---|---|
| **Outer-16 Cohort (`cand_01..08, 23..30`) Citation Share** | **62.5%** (at edges) $\rightarrow$ **52.0%** (in middle) | **66.7%** (at edges) $\rightarrow$ **64.0%** (in middle) | **Mechanism E is 3.9x more position-invariant** (`2.7%` vs `10.5%` swing) |
| **Middle-14 Cohort (`cand_09..22`) Citation Share** | **37.5%** (in middle) $\rightarrow$ **48.0%** (at edges) | **33.3%** (in middle) $\rightarrow$ **36.0%** (at edges) | Raw CVs over-index on whichever cohort sits at the edges |
| **Whole-Axis Survival Under Permutation** | **Fails**: `Quantified Model Performance` axis **vanishes completely** when `cand_06` & `cand_30` move to the middle; replaced by `Early Ownership Trajectory` anchored on new bottom-edge CVs (`cand_16`, `cand_17`) | **Passes**: All core technical axes (*Multimodal ML Metrics*, *RAG Architecture*, *Quantified Product Impact*, *Research Publications*) survive in both orders | Raw 20k-token prompt loses technical axes when key CVs sit in the middle |
| **Bottom-Edge Anchor Survival (`cand_30_wahaj_ahmad_butt`)** | **2 citations** (at pos #30) $\rightarrow$ **0 citations** (at pos #23, **100% lost**) | **3 citations** (at pos #30) $\rightarrow$ **2 citations** (at pos #23, `[s1]` & `[s4]` retained) | Mechanism E preserves `cand_30` even when buried in the middle |
| **`Quantified Product Impact` Citation Set Overlap** | N/A (axis did not exist in `raw` canonical) | **5 / 5 (100.0% exact match)**: `[cand_11:c1, c2, c3]`, `[cand_29:c2]`, `[cand_08:s3]` in both orders | Zero citation drift across permutation |
| **`Research / Publications` Core Candidate Overlap** | 4 / 5 candidates (`80%`) | **100% candidate overlap** (`cand_01`, `cand_20`, `cand_27` cited in both orders) | High-signal spikes are never lost in the middle |

```mermaid
xychart-beta
    title "Cohort Citation Share Across Permutations: Outer-16 Cohort (cand_01..08 + 23..30)"
    x-axis ["Raw: Canonical (At Edges)", "Raw: Inside-Out (In Middle)", "Mech E: Canonical (At Edges)", "Mech E: Inside-Out (In Middle)"]
    y-axis "Share of Pool Citations (%)" 0 --> 80
    bar [62.5, 52.0, 66.7, 64.0]
```

### 3.2 Detailed Breakdown: Why Raw CVs Drifted Under `inside-out` While Mechanism E Held Firm

1. **In Full Raw CVs ([raw-grad-ai-swe.axes.md](/docs/research/top-candidates/bench/axes-30-output/raw-grad-ai-swe.axes.md) vs. [raw-inside-out-grad-ai-swe.axes.md](/docs/research/top-candidates/bench/axes-30-output/raw-inside-out-grad-ai-swe.axes.md))**:
   - **Edge Recency Bias Creates and Destroys Entire Axes**: In `canonical` order, `cand_06` (position #6) and `cand_30` (position #30) sat near the prompt boundaries, prompting the LLM to create `axis_2: Quantified Model Performance` (citing `cand_06` and `cand_30`). When `cand_06` and `cand_30` were moved into the middle of the ~20,000-token raw prompt (`inside-out`), **`Quantified Model Performance` disappeared entirely**, and `cand_30` lost all citations (`2 -> 0`).
   - Meanwhile, because `cand_16_mehar_ali_ahmed`, `cand_17_ghulam_hussain_khan_sherwani`, and `cand_18_abdul_rehman` moved to the **bottom edge (`positions 24..26`)** in `inside-out`, their citations jumped from **1 total citation to 4 citations**, and the LLM invented a brand-new axis (`axis_5: Early Ownership Trajectory` — specifically citing *"leadership of a team/community of at least 10 people"*) tailored around `cand_16` and `cand_17` sitting at the bottom of the prompt.
2. **In Mechanism E ([exp1-budgeted-grad-ai-swe.axes.md](/docs/research/top-candidates/bench/axes-30-output/exp1-budgeted-grad-ai-swe.axes.md) vs. [exp1-budgeted-inside-out-grad-ai-swe.axes.md](/docs/research/top-candidates/bench/axes-30-output/exp1-budgeted-inside-out-grad-ai-swe.axes.md))**:
   - Because all 30 candidates occupy only **3,989 tokens** of high-density `[action]` / `[peripheral]` propositions, attention does not degrade across the middle 16 slots.
   - `Measured Multimodal Model Engineering` (`axis_1` in `inside-out`, `axis_2` in `canonical`) **remained a primary axis in both runs** and continued to cite `[cand_30:s1]` and `[cand_30:s4]` even when `cand_30` sat at position #23 in the middle.
   - `Quantified Product Impact` (`axis_4` in `canonical`, `axis_3` in `inside-out`) cited the **exact same 5 claims in the exact same order** (`[cand_11:c1]`, `[cand_11:c2]`, `[cand_11:c3]`, `[cand_29:c2]`, `[cand_08:s3]`), even though `cand_11` moved from the middle to the top edge and `cand_08` & `cand_29` moved from the outer edges into the middle.

---

## 4. Experiment 1 Deep-Dive: 30-CV Fact Budget & Compression Audit (`exp1-30-output`)

Full per-CV table available in [exp1-30-output/summary.md](/docs/research/top-candidates/bench/exp1-30-output/summary.md).

### 4.1 Aggregate Compression Statistics Across 30 Real Graduate Resumes

| Metric ($N = 30$) | Min | Median | Max | Interpretation |
|---|---:|---:|---:|---|
| **Raw Resume Tokens (approx)** | 217 | 639.5 | 837 | Raw resumes average ~600 tokens of mixed layout, filler, and claims. |
| **Verbatim Evidence Span Tokens** | 0 | 233.5 | 425 | Raw evidence sentences alone take up to 425 tokens. |
| **Uncapped Mechanism E Digest Tokens** | 14 | **144.5** | 241 | **27 of 30 CVs (90%)** naturally land $\le 200$ tokens without any cap. |
| **Budgeted Mechanism E Digest (@ 200t)** | 14 | **143.5** | **198** | Deterministic priority budgeting bounds the top 3 dense CVs to $\le 198$t. |
| **Raw-to-Uncapped Compression Ratio** | 2.55x | **4.10x** | 17.86x | Median **4.1x compression** across all 30 candidates. |
| **Evidence-to-Uncapped Ratio** | 0x | **1.60x** | 3.14x | Propositional tuple grammar is 1.6x–3.14x denser than raw sentences. |
| **Total Extracted Claims & Signals Kept** | — | — | — | **113 / 116 kept (97.4%)**; **18 unanchored filler claims** auto-dropped. |

---

## 5. Qualitative Smoking Gun: How Mechanism E Defeats Resume Inflation

From [cand_08_muhammad_rouhan_faisal.claims.json](/docs/research/top-candidates/bench/exp1-30-output/cand_08_muhammad_rouhan_faisal.claims.json):

- **What the Candidate Wrote on the Raw PDF (`cand_08`)**:
  > *"Assisted a 4-person team in developing a web application that simplifies the tender/procurement process, potentially reducing processing time by 60%. Contributed to the development of the front-end user interface using ReactJS..."*
- **How the Raw CV Baseline Reacted ([raw-grad-ai-swe.axes.md](/docs/research/top-candidates/bench/axes-output/raw-grad-ai-swe.axes.md))**:
  The LLM was fooled by the number `"60% processing-time reduction"` and enshrined it as a **Strong rubric benchmark** on `axis_4: Measured Impact & Validation` (*"approximately 98% model accuracy, around 60% processing-time reduction, or 100 users"*), failing to notice the candidate was an intern who merely *assisted* a team on an app that *potentially* reduced processing time.
- **How Mechanism E Handled the Exact Same Resume**:
  Mechanism E extracted `c2` as `[c2:peripheral]` (`peripheral_action`) with `"potentially -60% processing time"`:
  ```text
  work_2: Intern @ Cosmotech (2024-2024, 0.3y internship)
    [c2:peripheral] ReactJS, 4-person team -> supported tender procurement application | potentially -60% processing time
  spikes:
    [s3:action] Project: MongoDB, Express, Node.js -> built Chat Application real-time messenger | 100 concurrent users
  ```
  In both the 10-CV and 30-CV Stage 1 runs, Mechanism E **refused to promote `[c2:peripheral]` as a Strong impact benchmark**, citing only his verified `[s3:action] 100 concurrent users` build.

---

## 6. Stage 2 & Stage 3 Comparative Benchmark: Top-3 Ranking Tournament vs. Single-Pass Baselines

> **Full Sub-Report & Telemetry**: [06.2-top3-tournament-attention-and-bias-audit.md](/docs/research/top-candidates/06.2-top3-tournament-attention-and-bias-audit.md)  
> **Benchmark Script & Artifacts**: [rank-top-candidates-bench.ts](/scripts/rank-top-candidates-bench.ts) | [ranking-30-output](/docs/research/top-candidates/bench/ranking-30-output/comparative-summary.json)

To test whether sending all 30 candidate digests with emergent axes in a single call is sufficient to rank the Top 3 / Top 8 — or whether our multi-stage **Stage 2 (4-of-8 Reshuffled Halving + Forward/Reverse Cancellation) + Stage 3 (Full-CV 4x Latin-Square + 10x Bidirectional Pairwise Tournament)** is required — we benchmarked three ranking architectures across `canonical` (`1..30`) and `inside-out` (`[9..15, 1..8, 23..30, 16..22]`) permutations:

| Ranking Benchmark Metric ($N = 30$) | Baseline 1: `raw-single-pass` (30 Raw CVs in 1 Call) | Baseline 2: `digest-single-pass` (30 Digests + Axes in 1 Call) | **Mechanism E: `mech-e-tournament` (Halving + Full-CV Tournament)** |
|---|:---:|:---:|:---:|
| **Prompt Context per Call** | 30 Raw CVs (~18.7k tokens) | 30 Digests (~5.8k tokens) | **7–8 Digests (~1.0k tokens) in Stage 2; 8 or 2 Full CVs in Stage 3** |
| **Core Top 3 Overlap (`canonical` vs. `inside-out`)** | **2 / 3 (66.7%, Jaccard `50.0%`)** (`#3 cand_14` drops to `#6`!) | **3 / 3 (100.0%, Jaccard `100.0%`)** (`cand_25`, `cand_27`, `cand_14`) | **3 / 3 (100.0%, Jaccard `100.0%`)** (`cand_25`, `cand_27`, `cand_14`) |
| **Top 5 Contenders Overlap** | **3 / 5 (60.0%, Jaccard `42.9%`)** | **4 / 5 (80.0%, Jaccard `66.7%`)** | **4 / 5 (80.0%, Jaccard `66.7%`)** |
| **Top 8 Finalists Overlap** | 6 / 8 (75.0%, Jaccard `60.0%`) | **5 / 8 (62.5%, Jaccard `45.5%`)** *(3 of 4 mid-ranks `#5–#8` vanish)* | **6 / 8 (75.0%, Jaccard `60.0%`)** *(under reshuffled group draws)* |
| **Retention of #1 Product Spike (`cand_11`) in Top 8** | **0 / 2 runs (0%)** | **1 / 2 runs (50%)** | **2 / 2 runs (100%)** *(reloaded full CV places him at `#8` across 8/8 permutations)* |
| **Stage 2 Within-Group Order Bias Canceled** | None | None | **44 / 92 (47.8%) rank shifts canceled; 8 cutoff (`#4 vs #5`) flips caught** |
| **Stage 3A Finalist Slot Bias Canceled** | None | None | **14 / 16 (87.5%) finalist rank shifts smoothed via 4x Latin-Square shifts** |
| **Stage 3B Pairwise Recency-Flip Detection** | None | None | **100% (5 / 5) of flips caught** *(all 5 favored 2nd slot `Candidate B`)* |

### 6.1 Conclusion on Attention
1. **Raw Single-Pass (`~18.7k` tokens) Breaks Top-3 Integrity**: When `cand_20` moved to the bottom recency edge (`position #28`) in `inside-out`, the LLM vaulted him into `#3` and knocked `cand_14` (82.4% mIoU autonomous-driving model) down **3 full ranks from `#3` to `#6`**.
2. **Digest Single-Pass (`~5.8k` tokens) Fixes Top-3 Attention But Collapses at Ranks #5–#8 (`45.5%` Jaccard)**: Compressing 30 CVs into pointer digests allowed a single call to identify the same Top 4 (`cand_25`, `cand_27`, `cand_14`, `cand_30`), proving that 5x token compression restores top-of-list attention. However, sorting 30 items in a single pass still caused 3 of the 4 middle finalists (`cand_20`, `cand_11`, `cand_08`) to drop out of the Top 8 under permutation.
3. **Small-Batch Halving (Stage 2) + Full-CV Finalist Reload (Stage 3) Solves Both Problems**: Evaluating 7–8 digests per group in Stage 2 ensured `cand_11` (`+75% retention, +70% engagement`) advanced to the Top 8 finalists in **100% (2/2) of runs**, while reloading full CVs in Stage 3 revealed his UI/UX specialization (`Figma`/`Framer`) and placed him at **exact Rank #8 across 8 out of 8 Latin-Square permutations (`0.0` variance)**.

### 6.2 Conclusion on Biasedness (Positional Bias)
Our multi-stage telemetry proves that LLM positional bias is pervasive even in small prompts — and demonstrates how each tournament stage cancels it:
1. **Within-Group Order Bias (Stage 2)**: Across 92 candidate evaluations in 7–8 item groups, **44 / 92 (47.8%)** shifted rank when group order reversed (`mean |fwd - rev| = 0.59`, `max = 3 ranks`), including **8 cutoff-boundary flips (`#4` vs. `#5`)** where candidates like `cand_19_abdullah_khan` (`fwd = #6 -> rev = #3`) and `cand_11_muhammad_ahad_sajjad` (`fwd = #5 -> rev = #4`) were rescued from false single-order elimination.
2. **Finalist Slot Bias (Stage 3A)**: Across 16 finalist evaluations on full CVs, **14 / 16 (87.5%)** shifted by 1–2 ranks across the 4 cyclic Latin-Square permutations (even `#1 cand_25` dropped to `#3` in `Perm 3`). Averaging across 4 cyclic shifts produced a clean **1.75-rank separation** (`4.50` vs. `6.25`) between the Top 5 and Ranks #6–#8 in both runs.
3. **Pairwise Second-Slot Recency Bias (Stage 3B)**: Across 20 head-to-head pairs (40 LLM calls), **15 / 20 (75.0%)** were order-invariant, while **5 / 20 (25.0%)** flipped winners when reversed. Crucially, **100% (5 / 5) of flipped pairs awarded the win to whichever candidate sat in the second slot (`Candidate B`)**. Bidirectional verification (`A vs B` + `B vs A`) caught every single recency flip and resolved the `canonical` `#3 vs #4` tie (`cand_27` vs `cand_20`) as an explicit **`Contested`** Top 3 rather than an arbitrary positional guess.

---

## 7. Architectural Evolution Summary

| Dimension | Mechanism A/B (Fixed Schema / Pool Histograms) | Mechanism C (60t Micro-Digest) | Mechanism D (100t Prose Capsule) | **Mechanism E (Pointer Aspect Digest + Tournament)** |
|---|---|---|---|---|
| **Candidate Token Footprint ($N=30$)** | 0 CV tokens (histograms only) | ~1,800 tokens | ~3,000 tokens | **3,989 tokens (vs. 19,957 raw)** |
| **Fact & Claim Retention** | Fails (blind to uncataloged signals) | Drops non-skill scope & spikes | Drops 70% of facts in 1-line summary | **97.4% retention (113/116 kept @ 200t) + Full CVs for Top 8** |
| **Anti-Inflation (`syntactic_tier`)** | Canonical skills only | Canonical skills only | Destroyed by prose paraphrasing | **Preserved per claim (`[action]` vs `[peripheral]`)** |
| **Stage 1 Axis Positional Drift (`inside-out`)** | N/A | High (single-pass ranker) | Moderate | **Minimal (2.7% cohort delta vs. 10.5% raw)** |
| **Stage 2/3 Top-3 Ranking Stability & Bias Cancellation** | Arbitrary weighted sum | Single-pass 80-item sort (severe middle drop-off) | Single-pass sort (no order cancellation) | **100% (3/3) Top-3 overlap; cancels 47.8% group drift, 87.5% slot drift & 100% pairwise `Cand B` recency flips ([06.2](/docs/research/top-candidates/06.2-top3-tournament-attention-and-bias-audit.md))** |
| **$O(1)$ Quote Grounding ($N=30$)** | Skill-only spans | Truncated snippets | Paraphrased (hallucination risk) | **100% (49/49 Stage 1 & 41/42 Stage 3 pointer hydrated vs. 85.0%–93.2% raw free-text; see [06.1](/docs/research/top-candidates/06.1-citation-hydration-audit.md))** |
