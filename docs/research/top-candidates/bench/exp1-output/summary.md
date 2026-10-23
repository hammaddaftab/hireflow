# Experiment 1: Extraction Recall Audit Summary

## Audit Parameters
- Input Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/cvs`
- Output Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/exp1-output`
- Resumes Audited: 2
- Target Token Budget: 200 tokens
- Token Metric Note: Raw text, evidence span, and digest token numbers are approximate (computed as `Math.ceil(characters / 4)`). LLM tokens represent exact provider API usage.

## Aggregate Fact Budget & Compression Statistics
| Metric | Min | Median | Max |
|---|---|---|---|
| **Uncapped Digest Tokens (approx)** | 66 | 402 | 738 |
| **Budgeted Digest Tokens (approx, @ 200)** | 66 | 131 | 196 |
| **Evidence Span Tokens (approx)** | 190 | 1011 | 1832 |
| **Evidence-to-Uncapped Ratio** | 2.48x | 2.7x | 2.88x |
| **Raw-to-Uncapped Ratio** | 5.5x | 9.8x | 14.17x |

- Average Extraction Latency: **45517 ms**
- Safety Net Drops: **0** unanchored filler claims, **0** duplicate signals

## Per-CV Extraction Breakdown
| CV ID | Raw | Evidence | Uncapped | Budgeted (@ 200) | Evid/Uncap | Raw/Uncap | Claims | Signals | Kept/Total | Dropped IDs | Filler/Dups | Split (H/N/A/O) | LLM In/Out | Latency |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `mock_resume_a` | 4061 | 1832 | 738 | 196 | 2.48x | 5.5x | 12 | 10 | 6/22 | c1;c2;c3;c4;c5;c6;c7;c8;c9;c10;c11;c12;s1;s2;s4;s9 | 0/0 | 118/169/363/103 | 10321 / 8547 | 68209 ms |
| `mock_resume_b` | 935 | 190 | 66 | 66 | 2.88x | 14.17x | 0 | 2 | 2/2 | none | 0/0 | 21/11/35/0 | 7190 / 2099 | 22824 ms |

## Evaluation Notes
1. **Fact Budget Verification**: Measures whether stripping filler and grammatical scaffolding achieves compact digest tokens without dropping decisive technical claims.
2. **Deterministic Token Budgeting**: When a candidate has rich history exceeding 200 tokens, priority ranking preserves outcome-bearing and active claims first while keeping chronology intact.
3. **Annotation Matching**: Use `annotation-template.csv` to manually verify recall against planted differentiators (held-out plant recall target >= 95%, overall recall >= 90%). The `dropped_by_budget` column distinguishes extraction omissions from budget cuts.
