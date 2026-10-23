# CV Test Pool Directory (Experiment 1: Extraction Recall Audit)

## Purpose
This directory holds the raw curriculum vitae (CV) documents used to evaluate Mechanism E proposition extraction recall, held-out differentiator preservation, and fact token budgets.

Refer to the experiment specification in [/docs/research/top-candidates/05-test-bench.md](/docs/research/top-candidates/05-test-bench.md) (Section 4, Experiment 1).

## Usage
1. Place 15 to 20 candidate resumes in this directory as either `.pdf` or `.txt` files.
   - Resumes should include candidates with held-out planted differentiators (Section 3.1 of 05-test-bench.md).
   - Filenames should follow a consistent naming convention, e.g. `cand_01_backend.pdf`, `cand_02_lead.txt`.
2. Execute the extraction audit:
   ```bash
   npm run research:exp1
   ```
   Or run directly with custom parameters:
   ```bash
   NODE_OPTIONS='--conditions=react-server' npx tsx --env-file=.env scripts/extraction-recall-audit.ts --dir docs/research/top-candidates/bench/cvs --out docs/research/top-candidates/bench/exp1-output --provider openai --model gpt-4o-mini
   ```

## Output Artifacts
The script outputs results into `/docs/research/top-candidates/bench/exp1-output/`:
- `summary.csv`: Machine-readable token budgets, claims count, and latency metrics across all audited CVs.
- `summary.md`: Structured markdown report with min/median/max digest tokens and compression ratios.
- `annotation-template.csv`: Standardized spreadsheet for manual claim recall and held-out plant auditing.
- `<cv_name>.claims.json`: Full extracted `role_claims`, `notable_signals`, work history refs, and LLM token usage for each candidate.
- `<cv_name>.digest.txt`: Deterministically serialized Mechanism E pointer-backed digest.
