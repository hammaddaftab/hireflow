# Experiment 1: Extraction Recall Audit Summary

## Audit Parameters
- Input Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/cvs`
- Output Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/exp1-output`
- Resumes Audited: 10
- Target Token Budget: 200 tokens
- Token Metric Note: Raw text, evidence span, and digest token numbers are approximate (computed as `Math.ceil(characters / 4)`). LLM tokens represent exact provider API usage.

## Aggregate Fact Budget & Compression Statistics
| Metric | Min | Median | Max |
|---|---|---|---|
| **Uncapped Digest Tokens (approx)** | 14 | 132.5 | 189 |
| **Budgeted Digest Tokens (approx, @ 200)** | 14 | 132.5 | 189 |
| **Evidence Span Tokens (approx)** | 0 | 177.5 | 425 |
| **Evidence-to-Uncapped Ratio** | 0x | 1.3x | 2.25x |
| **Raw-to-Uncapped Ratio** | 3.05x | 4.1x | 17.86x |

- Average Extraction Latency: **22799 ms**
- Safety Net Drops: **4** unanchored filler claims, **1** duplicate signals

## Per-CV Extraction Breakdown
| CV ID | Raw | Evidence | Uncapped | Budgeted (@ 200) | Evid/Uncap | Raw/Uncap | Claims | Signals | Kept/Total | Dropped IDs | Filler/Dups | Split (H/N/A/O) | LLM In/Out | Latency |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `cand_01_muhammad_khizer_tariq` | 397 | 150 | 130 | 130 | 1.15x | 3.05x | 1 | 2 | 3/3 | none | 1/0 | 67/11/52/0 | 6686 / 3036 | 24662 ms |
| `cand_02_umer_tariq` | 250 | 0 | 14 | 14 | 0x | 17.86x | 0 | 0 | 0/0 | none | 0/0 | 14/0/0/0 | 6567 / 938 | 10598 ms |
| `cand_03_abdullah_aleem` | 720 | 357 | 160 | 160 | 2.23x | 4.5x | 1 | 4 | 5/5 | none | 1/0 | 53/36/73/0 | 6983 / 4025 | 29041 ms |
| `cand_04_mujtaba_shafqat` | 344 | 77 | 104 | 104 | 0.74x | 3.31x | 2 | 0 | 2/2 | none | 0/0 | 73/9/23/0 | 6672 / 2352 | 21772 ms |
| `cand_05_ali_murad` | 637 | 314 | 145 | 145 | 2.17x | 4.39x | 0 | 4 | 4/4 | none | 0/0 | 63/23/60/0 | 6983 / 4265 | 33268 ms |
| `cand_06_hasib_aslam` | 696 | 407 | 181 | 181 | 2.25x | 3.85x | 2 | 4 | 6/6 | none | 1/1 | 69/22/82/11 | 7052 / 3203 | 24092 ms |
| `cand_07_haram_nasir` | 298 | 60 | 74 | 74 | 0.81x | 4.03x | 1 | 1 | 2/2 | none | 0/0 | 40/8/28/0 | 6654 / 1918 | 17577 ms |
| `cand_08_muhammad_rouhan_faisal` | 710 | 425 | 189 | 189 | 2.25x | 3.76x | 2 | 4 | 6/6 | none | 0/0 | 51/31/96/15 | 7035 / 3649 | 27331 ms |
| `cand_09_hafiz_ahmed_hassan_chohan` | 642 | 205 | 135 | 135 | 1.52x | 4.76x | 0 | 3 | 3/3 | none | 1/0 | 78/12/46/0 | 6930 / 2954 | 25644 ms |
| `cand_10_muhammad_aleem_siddique_khan` | 272 | 61 | 65 | 65 | 0.94x | 4.18x | 1 | 0 | 1/1 | none | 0/0 | 39/13/13/0 | 6571 / 1503 | 14005 ms |

## Evaluation Notes
1. **Fact Budget Verification**: Measures whether stripping filler and grammatical scaffolding achieves compact digest tokens without dropping decisive technical claims.
2. **Deterministic Token Budgeting**: When a candidate has rich history exceeding 200 tokens, priority ranking preserves outcome-bearing and active claims first while keeping chronology intact.
3. **Annotation Matching**: Use `annotation-template.csv` to manually verify recall against planted differentiators (held-out plant recall target >= 95%, overall recall >= 90%). The `dropped_by_budget` column distinguishes extraction omissions from budget cuts.
