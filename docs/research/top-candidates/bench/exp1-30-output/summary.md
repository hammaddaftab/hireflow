# Experiment 1: Extraction Recall Audit Summary

## Audit Parameters
- Input Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/cvs`
- Output Directory: `/home/hammad/code/hackathon/docs/research/top-candidates/bench/exp1-30-output`
- Resumes Audited: 30
- Target Token Budget: 200 tokens
- Token Metric Note: Raw text, evidence span, and digest token numbers are approximate (computed as `Math.ceil(characters / 4)`). LLM tokens represent exact provider API usage.

## Aggregate Fact Budget & Compression Statistics
| Metric | Min | Median | Max |
|---|---|---|---|
| **Uncapped Digest Tokens (approx)** | 14 | 144.5 | 241 |
| **Budgeted Digest Tokens (approx, @ 200)** | 14 | 143.5 | 198 |
| **Evidence Span Tokens (approx)** | 0 | 233.5 | 425 |
| **Evidence-to-Uncapped Ratio** | 0x | 1.6x | 3.14x |
| **Raw-to-Uncapped Ratio** | 2.55x | 4.1x | 17.86x |

- Average Extraction Latency: **26305 ms**
- Safety Net Drops: **18** unanchored filler claims, **1** duplicate signals

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
| `cand_11_muhammad_ahad_sajjad` | 722 | 174 | 156 | 156 | 1.12x | 4.63x | 4 | 0 | 4/4 | none | 1/0 | 75/0/52/31 | 7070 / 4142 | 33017 ms |
| `cand_12_iqra_rasool` | 760 | 405 | 212 | 191 | 1.91x | 3.58x | 5 | 4 | 8/9 | s4 | 0/0 | 61/49/107/0 | 7091 / 4832 | 38518 ms |
| `cand_13_muhammad_uzair_khan` | 217 | 76 | 61 | 61 | 1.25x | 3.56x | 1 | 0 | 1/1 | none | 0/0 | 35/13/13/0 | 6489 / 1229 | 10609 ms |
| `cand_14_jatindar_kumar_mamnani` | 764 | 290 | 164 | 164 | 1.77x | 4.66x | 1 | 4 | 5/5 | none | 1/0 | 68/15/76/8 | 7083 / 4490 | 35043 ms |
| `cand_15_abdul_basit` | 595 | 186 | 114 | 114 | 1.63x | 5.22x | 0 | 3 | 3/3 | none | 2/0 | 67/4/44/0 | 6899 / 2787 | 24222 ms |
| `cand_16_mehar_ali_ahmed` | 593 | 285 | 233 | 198 | 1.22x | 2.55x | 3 | 4 | 5/7 | s3;s4 | 1/0 | 79/38/96/24 | 6958 / 4822 | 37986 ms |
| `cand_17_ghulam_hussain_khan_sherwani` | 455 | 226 | 72 | 72 | 3.14x | 6.32x | 0 | 3 | 3/3 | none | 0/0 | 20/9/45/0 | 6756 / 2056 | 17727 ms |
| `cand_18_abdul_rehman` | 679 | 186 | 102 | 102 | 1.82x | 6.66x | 0 | 3 | 3/3 | none | 4/0 | 42/18/43/0 | 6988 / 3676 | 29438 ms |
| `cand_19_abdullah_khan` | 423 | 108 | 109 | 109 | 0.99x | 3.88x | 1 | 2 | 3/3 | none | 2/0 | 59/2/40/10 | 6761 / 2915 | 25043 ms |
| `cand_20_ali_awais_safdar` | 837 | 309 | 241 | 137 | 1.28x | 3.47x | 0 | 5 | 5/5 | none | 0/0 | 141/26/77/0 | 7166 / 3992 | 33331 ms |
| `cand_21_prithvi_raj` | 760 | 403 | 135 | 135 | 2.99x | 5.63x | 1 | 4 | 5/5 | none | 0/0 | 33/32/73/0 | 7027 / 3274 | 31855 ms |
| `cand_22_mariam_babar_khan` | 759 | 273 | 152 | 152 | 1.8x | 4.99x | 0 | 4 | 4/4 | none | 0/0 | 72/24/59/0 | 7140 / 3366 | 28953 ms |
| `cand_23_muhammad_zaeem_khalid` | 630 | 237 | 170 | 170 | 1.39x | 3.71x | 4 | 2 | 6/6 | none | 0/0 | 55/39/79/0 | 6961 / 3298 | 28353 ms |
| `cand_24_abdullah_saim` | 670 | 243 | 184 | 184 | 1.32x | 3.64x | 2 | 4 | 6/6 | none | 0/0 | 76/22/87/0 | 7015 / 3308 | 27705 ms |
| `cand_25_muhammad_abdullah` | 453 | 156 | 143 | 143 | 1.09x | 3.17x | 1 | 3 | 4/4 | none | 2/0 | 52/30/60/4 | 6799 / 3512 | 29132 ms |
| `cand_26_mohammad_irfan` | 315 | 93 | 30 | 30 | 3.1x | 10.5x | 0 | 1 | 1/1 | none | 0/0 | 16/0/14/0 | 6610 / 1732 | 16323 ms |
| `cand_27_muhammad_taha_mukhtar` | 580 | 291 | 183 | 183 | 1.59x | 3.17x | 3 | 2 | 5/5 | none | 0/0 | 70/30/69/18 | 6903 / 3774 | 29010 ms |
| `cand_28_umama_zainab` | 756 | 277 | 171 | 171 | 1.62x | 4.42x | 0 | 4 | 4/4 | none | 0/0 | 90/20/62/0 | 7125 / 3181 | 28616 ms |
| `cand_29_abdul_ahad_qureshi` | 454 | 230 | 175 | 175 | 1.31x | 2.59x | 2 | 3 | 5/5 | none | 1/0 | 71/26/69/12 | 6753 / 3549 | 30319 ms |
| `cand_30_wahaj_ahmad_butt` | 662 | 296 | 144 | 144 | 2.06x | 4.6x | 0 | 4 | 4/4 | none | 0/0 | 53/25/63/5 | 6964 / 2966 | 25955 ms |

## Evaluation Notes
1. **Fact Budget Verification**: Measures whether stripping filler and grammatical scaffolding achieves compact digest tokens without dropping decisive technical claims.
2. **Deterministic Token Budgeting**: When a candidate has rich history exceeding 200 tokens, priority ranking preserves outcome-bearing and active claims first while keeping chronology intact.
3. **Annotation Matching**: Use `annotation-template.csv` to manually verify recall against planted differentiators (held-out plant recall target >= 95%, overall recall >= 90%). The `dropped_by_budget` column distinguishes extraction omissions from budget cuts.
