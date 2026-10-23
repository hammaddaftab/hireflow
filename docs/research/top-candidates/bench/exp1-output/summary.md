# Experiment 1: Extraction Recall Audit Summary

## Audit Parameters
- Input Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/cvs`
- Output Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/exp1-output`
- Resumes Audited: 2
- Token Metric Note: Raw text, evidence span, and digest token numbers are **approximate** (computed as `Math.ceil(characters / 4)`). LLM tokens represent exact provider API usage.

## Aggregate Fact Budget & Compression Statistics
| Metric | Min | Median | Max |
|---|---|---|---|
| **Digest Tokens (approx)** | 163 | 1051 | 1939 |
| **Evidence Span Tokens (approx)** | 179 | 1066 | 1953 |
| **Evidence-to-Digest Compression Ratio** | 1.01x | 1.1x | 1.1x |

Average Extraction Latency: **55662 ms**

## Per-CV Extraction Breakdown
| CV ID | Filename | Raw Tokens (approx) | Evidence Tokens (approx) | Digest Tokens (approx) | Compression Ratio | Claims | Signals | LLM In / Out | Latency |
|---|---|---|---|---|---|---|---|---|---|
| `mock_resume_a` | mock_resume_a.pdf | 4061 | 1953 | 1939 | 1.01x | 30 | 14 | 8507 / 12561 | 87548 ms |
| `mock_resume_b` | mock_resume_b.pdf | 935 | 179 | 163 | 1.1x | 0 | 3 | 5814 / 2464 | 23775 ms |

## Evaluation Notes
1. **Fact Budget Verification**: Measures whether stripping filler and grammatical scaffolding from claim-bearing sentences achieves ~150-200 digest tokens without dropping decisive technical claims.
2. **Annotation Matching**: Use `annotation-template.csv` to manually verify recall against planted differentiators (held-out plant recall target >= 95%, overall recall >= 90%).
