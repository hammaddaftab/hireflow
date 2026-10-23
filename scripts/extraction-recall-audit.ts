// Experiment 1: Extraction Recall Audit CLI Script
// Validates propositional de-noising claim retention and fact budgets across resumes

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { extractCandidateProfileWithUsage } from "../src/lib/extraction/pipeline/candidateExtractionService";
import {
  serializeCandidateDigestWithStats,
  approxTokens,
} from "../src/lib/extraction/digest/serializeCandidateDigest";
import { extractTextFromPdf } from "../src/lib/pdf/extractText";
import type { AiProvider } from "../src/lib/ai/types";

interface AuditCliOptions {
  inputDir: string;
  outputDir: string;
  provider?: AiProvider;
  model?: string;
  limit?: number;
  timeoutMs?: number;
  budget?: number;
}

interface CvAuditResult {
  cvId: string;
  filename: string;
  rawTextTokensApprox: number;
  evidenceTokensApprox: number;
  uncappedDigestTokensApprox: number;
  budgetedDigestTokensApprox: number;
  evidenceToUncappedRatio: number;
  rawToUncappedRatio: number;
  claimCount: number;
  signalCount: number;
  keptItemsBudgeted: number;
  totalItemsBudgeted: number;
  droppedIdsBudgeted: string[];
  fillerDropped: number;
  duplicatesDropped: number;
  tokenSplitUncapped: {
    headers: number;
    nouns: number;
    actions: number;
    outcomes: number;
  };
  llmInputTokens: number | null;
  llmOutputTokens: number | null;
  latencyMs: number;
}

// Parses command-line arguments into structured options
function parseArgs(argv: string[]): AuditCliOptions {
  const options: AuditCliOptions = {
    inputDir: resolve("docs/research/top-candidates/bench/cvs"),
    outputDir: resolve("docs/research/top-candidates/bench/exp1-output"),
    budget: 200,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir" && argv[i + 1]) {
      options.inputDir = resolve(argv[++i]);
    } else if (arg === "--out" && argv[i + 1]) {
      options.outputDir = resolve(argv[++i]);
    } else if (arg === "--provider" && argv[i + 1]) {
      options.provider = argv[++i] as AiProvider;
    } else if (arg === "--model" && argv[i + 1]) {
      options.model = argv[++i];
    } else if (arg === "--limit" && argv[i + 1]) {
      options.limit = parseInt(argv[++i], 10);
    } else if ((arg === "--timeout" || arg === "--timeout-ms") && argv[i + 1]) {
      options.timeoutMs = parseInt(argv[++i], 10);
    } else if (arg === "--budget" && argv[i + 1]) {
      options.budget = parseInt(argv[++i], 10);
    }
  }

  return options;
}

// Computes median of a numeric array
function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
  }
  return Math.round(sorted[mid] * 10) / 10;
}

async function main() {
  const options = parseArgs(process.argv);

  console.log("================================================================================");
  console.log("       MECHANISM E: EXPERIMENT 1 EXTRACTION RECALL & TOKEN BUDGET AUDIT         ");
  console.log("================================================================================");
  console.log(`Input Directory : ${options.inputDir}`);
  console.log(`Output Directory: ${options.outputDir}`);
  if (options.provider) console.log(`Provider        : ${options.provider}`);
  if (options.model) console.log(`Model           : ${options.model}`);
  console.log(`Token Budget    : ${options.budget} tokens`);
  console.log(`Timeout         : ${options.timeoutMs && options.timeoutMs > 0 ? `${options.timeoutMs}ms` : "Infinite (disabled)"}`);
  console.log("--------------------------------------------------------------------------------\n");

  if (!existsSync(options.inputDir)) {
    mkdirSync(options.inputDir, { recursive: true });
  }
  if (!existsSync(options.outputDir)) {
    mkdirSync(options.outputDir, { recursive: true });
  }

  // Discover candidate CV files (.pdf and .txt)
  const allEntries = readdirSync(options.inputDir);
  const cvFiles = allEntries
    .filter((f) => !f.startsWith(".") && !f.toLowerCase().endsWith(".md"))
    .filter((f) => {
      const ext = extname(f).toLowerCase();
      return ext === ".pdf" || ext === ".txt";
    });

  if (cvFiles.length === 0) {
    console.log(`No CV files (.pdf or .txt) found in: ${options.inputDir}`);
    console.log("Place sample resumes in that folder and re-run:");
    console.log("  npm run research:exp1");
    console.log("\nGenerating empty annotation-template.csv in output directory for reference...");

    const templateCsv = [
      "cv_id,annotated_claim,category,planted,matched_claim_id,dropped_by_budget,notes",
      'sample_cv,"Built Go microservice for Raast settlements",work,yes,,no,Core payments claim',
      'sample_cv,"Sole engineer at 4-person startup",org_context,yes,,no,Organizational scope',
    ].join("\n");
    writeFileSync(join(options.outputDir, "annotation-template.csv"), templateCsv, "utf-8");
    return;
  }

  const selectedFiles = options.limit ? cvFiles.slice(0, options.limit) : cvFiles;
  console.log(`Discovered ${selectedFiles.length} CV file(s) to process.\n`);

  const results: CvAuditResult[] = [];
  const annotationRows: string[] = [
    "cv_id,annotated_claim,category,planted,matched_claim_id,dropped_by_budget,notes",
  ];

  for (let idx = 0; idx < selectedFiles.length; idx++) {
    const filename = selectedFiles[idx];
    const filePath = join(options.inputDir, filename);
    const cvId = basename(filename, extname(filename));

    console.log(`[${idx + 1}/${selectedFiles.length}] Processing ${filename}...`);

    let rawText = "";
    try {
      const ext = extname(filename).toLowerCase();
      if (ext === ".pdf") {
        const buffer = readFileSync(filePath);
        rawText = await extractTextFromPdf(buffer);
      } else {
        rawText = readFileSync(filePath, "utf-8");
      }
    } catch (err) {
      console.error(`  Failed to read file ${filename}:`, err);
      continue;
    }

    if (!rawText.trim()) {
      console.warn(`  Warning: Extracted text for ${filename} is empty; skipping.`);
      continue;
    }

    // Run extraction with token usage instrumentation and infinite default timeout
    const startTime = performance.now();
    let extractionRes;
    try {
      extractionRes = await extractCandidateProfileWithUsage(rawText, {
        filename,
        provider: options.provider,
        model: options.model,
        timeoutMs: options.timeoutMs ?? 0,
      });
    } catch (err) {
      console.error(`  Extraction failed for ${filename}:`, err);
      continue;
    }
    const latencyMs = Math.round(performance.now() - startTime);

    const { profile, usage, cleanupStats } = extractionRes;

    // Serialize uncapped and budgeted Mechanism E digests
    const uncappedResult = serializeCandidateDigestWithStats(profile, { candidateLabel: cvId });
    const budgetedResult = serializeCandidateDigestWithStats(profile, {
      candidateLabel: cvId,
      tokenBudget: options.budget,
    });

    // Compute token metrics
    const rawTokens = approxTokens(rawText);
    const uncappedDigestTokens = uncappedResult.approxTokens;
    const budgetedDigestTokens = budgetedResult.approxTokens;

    // Sum evidence span tokens across claims and notable signals
    let evidenceText = "";
    for (const c of profile.role_claims?.claims || []) {
      if (c.evidence_span) evidenceText += `${c.evidence_span}\n`;
    }
    for (const s of profile.notable_signals?.signals || []) {
      if (s.evidence_span) evidenceText += `${s.evidence_span}\n`;
    }
    const evidenceTokens = approxTokens(evidenceText);
    const evidenceToUncappedRatio =
      uncappedDigestTokens > 0
        ? Math.round((evidenceTokens / uncappedDigestTokens) * 100) / 100
        : 0;
    const rawToUncappedRatio =
      uncappedDigestTokens > 0
        ? Math.round((rawTokens / uncappedDigestTokens) * 100) / 100
        : 0;

    const claimCount = profile.role_claims?.claims?.length || 0;
    const signalCount = profile.notable_signals?.signals?.length || 0;
    const fillerDropped = cleanupStats?.fillerDropped || 0;
    const duplicatesDropped = cleanupStats?.duplicatesDropped || 0;

    const auditItem: CvAuditResult = {
      cvId,
      filename,
      rawTextTokensApprox: rawTokens,
      evidenceTokensApprox: evidenceTokens,
      uncappedDigestTokensApprox: uncappedDigestTokens,
      budgetedDigestTokensApprox: budgetedDigestTokens,
      evidenceToUncappedRatio,
      rawToUncappedRatio,
      claimCount,
      signalCount,
      keptItemsBudgeted: budgetedResult.keptItems,
      totalItemsBudgeted: budgetedResult.totalItems,
      droppedIdsBudgeted: budgetedResult.droppedItemIds,
      fillerDropped,
      duplicatesDropped,
      tokenSplitUncapped: uncappedResult.tokenBreakdown,
      llmInputTokens: usage?.inputTokens ?? usage?.promptTokens ?? null,
      llmOutputTokens: usage?.outputTokens ?? usage?.completionTokens ?? null,
      latencyMs,
    };
    results.push(auditItem);

    // Write per-CV artifact 1: <cvId>.claims.json
    const claimsJsonPath = join(options.outputDir, `${cvId}.claims.json`);
    const claimsPayload = {
      cv_id: cvId,
      filename,
      work_history_summary: (profile.work_history?.entries || []).map((e) => ({
        entry_id: e.entry_id,
        employer: e.employer,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        is_current: e.is_current,
      })),
      role_claims: profile.role_claims?.claims || [],
      notable_signals: profile.notable_signals?.signals || [],
      cleanup_stats: {
        filler_dropped: fillerDropped,
        duplicates_dropped: duplicatesDropped,
      },
      digest_stats_uncapped: {
        approx_tokens: uncappedResult.approxTokens,
        total_items: uncappedResult.totalItems,
        kept_items: uncappedResult.keptItems,
        token_breakdown: uncappedResult.tokenBreakdown,
      },
      digest_stats_budgeted: {
        budget: options.budget,
        approx_tokens: budgetedResult.approxTokens,
        total_items: budgetedResult.totalItems,
        kept_items: budgetedResult.keptItems,
        dropped_item_ids: budgetedResult.droppedItemIds,
        token_breakdown: budgetedResult.tokenBreakdown,
      },
      warnings: profile.extraction_metadata?.warnings || [],
      usage: usage || null,
      latency_ms: latencyMs,
      tokens_approx: {
        raw_text: rawTokens,
        evidence_spans: evidenceTokens,
        uncapped_digest: uncappedDigestTokens,
        budgeted_digest: budgetedDigestTokens,
      },
    };
    writeFileSync(claimsJsonPath, JSON.stringify(claimsPayload, null, 2), "utf-8");

    // Write per-CV artifact 2: <cvId>.digest.txt (uncapped)
    const digestTxtPath = join(options.outputDir, `${cvId}.digest.txt`);
    writeFileSync(digestTxtPath, uncappedResult.text, "utf-8");

    // Write per-CV artifact 3: <cvId>.digest.budget.txt (budgeted)
    const budgetedDigestTxtPath = join(options.outputDir, `${cvId}.digest.budget.txt`);
    writeFileSync(budgetedDigestTxtPath, budgetedResult.text, "utf-8");

    // Pre-populate annotation template rows with dropped_by_budget indicator
    const droppedSet = new Set(budgetedResult.droppedItemIds);
    for (const claim of profile.role_claims?.claims || []) {
      const escapedAction = `"${claim.compact_action.replace(/"/g, '""')}"`;
      const droppedByBudget = droppedSet.has(claim.claim_id) ? "yes" : "no";
      annotationRows.push(
        `${cvId},${escapedAction},work,no,${claim.claim_id},${droppedByBudget},`
      );
    }
    for (const sig of profile.notable_signals?.signals || []) {
      const escapedAction = `"${sig.compact_action.replace(/"/g, '""')}"`;
      const droppedByBudget = droppedSet.has(sig.signal_id) ? "yes" : "no";
      annotationRows.push(
        `${cvId},${escapedAction},non_work,no,${sig.signal_id},${droppedByBudget},`
      );
    }

    console.log(
      `  -> Claims: ${claimCount} | Signals: ${signalCount} | Uncapped: ${uncappedDigestTokens}t | Budgeted (@ ${options.budget}): ${budgetedDigestTokens}t (${budgetedResult.keptItems}/${budgetedResult.totalItems} kept) | Latency: ${latencyMs}ms`
    );
  }

  // Write summary.csv
  const csvHeaders = [
    "cv_id",
    "filename",
    "raw_tokens_approx",
    "evidence_tokens_approx",
    "uncapped_digest_tokens_approx",
    "budgeted_digest_tokens_approx",
    "evidence_to_uncapped_ratio",
    "raw_to_uncapped_ratio",
    "claim_count",
    "signal_count",
    "kept_total_budgeted",
    "dropped_ids_budgeted",
    "filler_dropped",
    "duplicates_dropped",
    "token_split_uncapped_h_n_a_o",
    "llm_input_tokens",
    "llm_output_tokens",
    "latency_ms",
  ];
  const csvLines = [
    csvHeaders.join(","),
    ...results.map((r) =>
      [
        r.cvId,
        r.filename,
        r.rawTextTokensApprox,
        r.evidenceTokensApprox,
        r.uncappedDigestTokensApprox,
        r.budgetedDigestTokensApprox,
        r.evidenceToUncappedRatio,
        r.rawToUncappedRatio,
        r.claimCount,
        r.signalCount,
        `"${r.keptItemsBudgeted}/${r.totalItemsBudgeted}"`,
        `"${r.droppedIdsBudgeted.join(";") || "none"}"`,
        r.fillerDropped,
        r.duplicatesDropped,
        `"${r.tokenSplitUncapped.headers}/${r.tokenSplitUncapped.nouns}/${r.tokenSplitUncapped.actions}/${r.tokenSplitUncapped.outcomes}"`,
        r.llmInputTokens ?? "",
        r.llmOutputTokens ?? "",
        r.latencyMs,
      ].join(",")
    ),
  ];
  writeFileSync(join(options.outputDir, "summary.csv"), csvLines.join("\n"), "utf-8");

  // Write summary.md with aggregate statistics
  const uncappedTokensList = results.map((r) => r.uncappedDigestTokensApprox);
  const budgetedTokensList = results.map((r) => r.budgetedDigestTokensApprox);
  const evidenceTokensList = results.map((r) => r.evidenceTokensApprox);
  const rawRatioList = results.map((r) => r.rawToUncappedRatio);
  const evidenceRatioList = results.map((r) => r.evidenceToUncappedRatio);

  const minUncapped = uncappedTokensList.length > 0 ? Math.min(...uncappedTokensList) : 0;
  const maxUncapped = uncappedTokensList.length > 0 ? Math.max(...uncappedTokensList) : 0;
  const medianUncapped = computeMedian(uncappedTokensList);

  const minBudgeted = budgetedTokensList.length > 0 ? Math.min(...budgetedTokensList) : 0;
  const maxBudgeted = budgetedTokensList.length > 0 ? Math.max(...budgetedTokensList) : 0;
  const medianBudgeted = computeMedian(budgetedTokensList);

  const minEvidence = evidenceTokensList.length > 0 ? Math.min(...evidenceTokensList) : 0;
  const maxEvidence = evidenceTokensList.length > 0 ? Math.max(...evidenceTokensList) : 0;
  const medianEvidence = computeMedian(evidenceTokensList);

  const minEvidenceRatio = evidenceRatioList.length > 0 ? Math.min(...evidenceRatioList) : 0;
  const maxEvidenceRatio = evidenceRatioList.length > 0 ? Math.max(...evidenceRatioList) : 0;
  const medianEvidenceRatio = computeMedian(evidenceRatioList);

  const minRawRatio = rawRatioList.length > 0 ? Math.min(...rawRatioList) : 0;
  const maxRawRatio = rawRatioList.length > 0 ? Math.max(...rawRatioList) : 0;
  const medianRawRatio = computeMedian(rawRatioList);

  const avgLatency =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length)
      : 0;

  const totalFillerDropped = results.reduce((acc, r) => acc + r.fillerDropped, 0);
  const totalDupsDropped = results.reduce((acc, r) => acc + r.duplicatesDropped, 0);

  const markdownContent = `# Experiment 1: Extraction Recall Audit Summary

## Audit Parameters
- Input Directory: \`${options.inputDir}\`
- Output Directory: \`${options.outputDir}\`
- Resumes Audited: ${results.length}
- Target Token Budget: ${options.budget} tokens
- Token Metric Note: Raw text, evidence span, and digest token numbers are approximate (computed as \`Math.ceil(characters / 4)\`). LLM tokens represent exact provider API usage.

## Aggregate Fact Budget & Compression Statistics
| Metric | Min | Median | Max |
|---|---|---|---|
| **Uncapped Digest Tokens (approx)** | ${minUncapped} | ${medianUncapped} | ${maxUncapped} |
| **Budgeted Digest Tokens (approx, @ ${options.budget})** | ${minBudgeted} | ${medianBudgeted} | ${maxBudgeted} |
| **Evidence Span Tokens (approx)** | ${minEvidence} | ${medianEvidence} | ${maxEvidence} |
| **Evidence-to-Uncapped Ratio** | ${minEvidenceRatio}x | ${medianEvidenceRatio}x | ${maxEvidenceRatio}x |
| **Raw-to-Uncapped Ratio** | ${minRawRatio}x | ${medianRawRatio}x | ${maxRawRatio}x |

- Average Extraction Latency: **${avgLatency} ms**
- Safety Net Drops: **${totalFillerDropped}** unanchored filler claims, **${totalDupsDropped}** duplicate signals

## Per-CV Extraction Breakdown
| CV ID | Raw | Evidence | Uncapped | Budgeted (@ ${options.budget}) | Evid/Uncap | Raw/Uncap | Claims | Signals | Kept/Total | Dropped IDs | Filler/Dups | Split (H/N/A/O) | LLM In/Out | Latency |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${results
  .map(
    (r) =>
      `| \`${r.cvId}\` | ${r.rawTextTokensApprox} | ${r.evidenceTokensApprox} | ${r.uncappedDigestTokensApprox} | ${r.budgetedDigestTokensApprox} | ${r.evidenceToUncappedRatio}x | ${r.rawToUncappedRatio}x | ${r.claimCount} | ${r.signalCount} | ${r.keptItemsBudgeted}/${r.totalItemsBudgeted} | ${r.droppedIdsBudgeted.length > 0 ? r.droppedIdsBudgeted.join(";") : "none"} | ${r.fillerDropped}/${r.duplicatesDropped} | ${r.tokenSplitUncapped.headers}/${r.tokenSplitUncapped.nouns}/${r.tokenSplitUncapped.actions}/${r.tokenSplitUncapped.outcomes} | ${r.llmInputTokens ?? "N/A"} / ${r.llmOutputTokens ?? "N/A"} | ${r.latencyMs} ms |`
  )
  .join("\n")}

## Evaluation Notes
1. **Fact Budget Verification**: Measures whether stripping filler and grammatical scaffolding achieves compact digest tokens without dropping decisive technical claims.
2. **Deterministic Token Budgeting**: When a candidate has rich history exceeding ${options.budget} tokens, priority ranking preserves outcome-bearing and active claims first while keeping chronology intact.
3. **Annotation Matching**: Use \`annotation-template.csv\` to manually verify recall against planted differentiators (held-out plant recall target >= 95%, overall recall >= 90%). The \`dropped_by_budget\` column distinguishes extraction omissions from budget cuts.
`;
  writeFileSync(join(options.outputDir, "summary.md"), markdownContent, "utf-8");

  // Write annotation-template.csv
  writeFileSync(
    join(options.outputDir, "annotation-template.csv"),
    annotationRows.join("\n"),
    "utf-8"
  );

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`Successfully completed audit over ${results.length} CV(s).`);
  console.log(`Artifacts generated in: ${options.outputDir}`);
  console.log("  - summary.csv");
  console.log("  - summary.md");
  console.log("  - annotation-template.csv");
  console.log("  - *.claims.json");
  console.log("  - *.digest.txt");
  console.log("  - *.digest.budget.txt");
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Fatal error during extraction audit:", err);
  process.exit(1);
});
