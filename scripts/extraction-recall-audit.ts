// Experiment 1: Extraction Recall Audit CLI Script
// Validates propositional de-noising claim retention and fact budgets across resumes

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { extractCandidateProfileWithUsage } from "../src/lib/extraction/pipeline/candidateExtractionService";
import { serializeCandidateDigest } from "../src/lib/extraction/digest/serializeCandidateDigest";
import { extractTextFromPdf } from "../src/lib/pdf/extractText";
import type { AiProvider } from "../src/lib/ai/types";

interface AuditCliOptions {
  inputDir: string;
  outputDir: string;
  provider?: AiProvider;
  model?: string;
  limit?: number;
  timeoutMs?: number;
}

interface CvAuditResult {
  cvId: string;
  filename: string;
  rawTextTokensApprox: number;
  evidenceTokensApprox: number;
  digestTokensApprox: number;
  compressionRatio: number;
  claimCount: number;
  signalCount: number;
  llmInputTokens: number | null;
  llmOutputTokens: number | null;
  latencyMs: number;
}

// Approximate token counter using standard chars/4 heuristic
function approxTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Parses command-line arguments into structured options
function parseArgs(argv: string[]): AuditCliOptions {
  const options: AuditCliOptions = {
    inputDir: resolve("docs/research/top-candidates/bench/cvs"),
    outputDir: resolve("docs/research/top-candidates/bench/exp1-output"),
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
      "cv_id,annotated_claim,category,planted,matched_claim_id,notes",
      'sample_cv,"Built Go microservice for Raast settlements",work,yes,,Core payments claim',
      'sample_cv,"Sole engineer at 4-person startup",org_context,yes,,Organizational scope',
    ].join("\n");
    writeFileSync(join(options.outputDir, "annotation-template.csv"), templateCsv, "utf-8");
    return;
  }

  const selectedFiles = options.limit ? cvFiles.slice(0, options.limit) : cvFiles;
  console.log(`Discovered ${selectedFiles.length} CV file(s) to process.\n`);

  const results: CvAuditResult[] = [];
  const annotationRows: string[] = [
    "cv_id,annotated_claim,category,planted,matched_claim_id,notes",
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

    // Run extraction with token usage instrumentation
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

    const { profile, usage } = extractionRes;

    // Serialize deterministic Mechanism E digest
    const digest = serializeCandidateDigest(profile, { candidateLabel: cvId });

    // Compute metrics
    const rawTokens = approxTokens(rawText);
    const digestTokens = approxTokens(digest);

    // Sum evidence span tokens across claims and notable signals (proxy for claim-bearing sentences)
    let evidenceText = "";
    for (const c of profile.role_claims?.claims || []) {
      if (c.evidence_span) evidenceText += `${c.evidence_span}\n`;
    }
    for (const s of profile.notable_signals?.signals || []) {
      if (s.evidence_span) evidenceText += `${s.evidence_span}\n`;
    }
    const evidenceTokens = approxTokens(evidenceText);
    const compRatio =
      digestTokens > 0 ? Math.round((evidenceTokens / digestTokens) * 100) / 100 : 0;

    const claimCount = profile.role_claims?.claims?.length || 0;
    const signalCount = profile.notable_signals?.signals?.length || 0;

    const auditItem: CvAuditResult = {
      cvId,
      filename,
      rawTextTokensApprox: rawTokens,
      evidenceTokensApprox: evidenceTokens,
      digestTokensApprox: digestTokens,
      compressionRatio: compRatio,
      claimCount,
      signalCount,
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
      warnings: profile.extraction_metadata?.warnings || [],
      usage: usage || null,
      latency_ms: latencyMs,
      tokens_approx: {
        raw_text: rawTokens,
        evidence_spans: evidenceTokens,
        digest: digestTokens,
      },
    };
    writeFileSync(claimsJsonPath, JSON.stringify(claimsPayload, null, 2), "utf-8");

    // Write per-CV artifact 2: <cvId>.digest.txt
    const digestTxtPath = join(options.outputDir, `${cvId}.digest.txt`);
    writeFileSync(digestTxtPath, digest, "utf-8");

    // Pre-populate annotation template rows
    for (const claim of profile.role_claims?.claims || []) {
      const escapedAction = `"${claim.compact_action.replace(/"/g, '""')}"`;
      annotationRows.push(
        `${cvId},${escapedAction},work,no,${claim.claim_id},`
      );
    }
    for (const sig of profile.notable_signals?.signals || []) {
      const escapedAction = `"${sig.compact_action.replace(/"/g, '""')}"`;
      annotationRows.push(
        `${cvId},${escapedAction},non_work,no,${sig.signal_id},`
      );
    }

    console.log(
      `  -> Claims: ${claimCount} | Signals: ${signalCount} | Digest Tokens (approx): ${digestTokens} | Latency: ${latencyMs}ms`
    );
  }

  // 4. Write summary.csv
  const csvHeaders = [
    "cv_id",
    "filename",
    "raw_text_tokens_approx",
    "evidence_tokens_approx",
    "digest_tokens_approx",
    "evidence_to_digest_ratio",
    "claim_count",
    "signal_count",
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
        r.digestTokensApprox,
        r.compressionRatio,
        r.claimCount,
        r.signalCount,
        r.llmInputTokens ?? "",
        r.llmOutputTokens ?? "",
        r.latencyMs,
      ].join(",")
    ),
  ];
  writeFileSync(join(options.outputDir, "summary.csv"), csvLines.join("\n"), "utf-8");

  // 5. Write summary.md with aggregate statistics
  const digestTokensList = results.map((r) => r.digestTokensApprox);
  const evidenceTokensList = results.map((r) => r.evidenceTokensApprox);
  const ratioList = results.map((r) => r.compressionRatio);

  const minDigest = digestTokensList.length > 0 ? Math.min(...digestTokensList) : 0;
  const maxDigest = digestTokensList.length > 0 ? Math.max(...digestTokensList) : 0;
  const medianDigest = computeMedian(digestTokensList);

  const minEvidence = evidenceTokensList.length > 0 ? Math.min(...evidenceTokensList) : 0;
  const maxEvidence = evidenceTokensList.length > 0 ? Math.max(...evidenceTokensList) : 0;
  const medianEvidence = computeMedian(evidenceTokensList);

  const minRatio = ratioList.length > 0 ? Math.min(...ratioList) : 0;
  const maxRatio = ratioList.length > 0 ? Math.max(...ratioList) : 0;
  const medianRatio = computeMedian(ratioList);

  const avgLatency =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length)
      : 0;

  const markdownContent = `# Experiment 1: Extraction Recall Audit Summary

## Audit Parameters
- Input Directory: \`${options.inputDir}\`
- Output Directory: \`${options.outputDir}\`
- Resumes Audited: ${results.length}
- Token Metric Note: Raw text, evidence span, and digest token numbers are **approximate** (computed as \`Math.ceil(characters / 4)\`). LLM tokens represent exact provider API usage.

## Aggregate Fact Budget & Compression Statistics
| Metric | Min | Median | Max |
|---|---|---|---|
| **Digest Tokens (approx)** | ${minDigest} | ${medianDigest} | ${maxDigest} |
| **Evidence Span Tokens (approx)** | ${minEvidence} | ${medianEvidence} | ${maxEvidence} |
| **Evidence-to-Digest Compression Ratio** | ${minRatio}x | ${medianRatio}x | ${maxRatio}x |

Average Extraction Latency: **${avgLatency} ms**

## Per-CV Extraction Breakdown
| CV ID | Filename | Raw Tokens (approx) | Evidence Tokens (approx) | Digest Tokens (approx) | Compression Ratio | Claims | Signals | LLM In / Out | Latency |
|---|---|---|---|---|---|---|---|---|---|
${results
  .map(
    (r) =>
      `| \`${r.cvId}\` | ${r.filename} | ${r.rawTextTokensApprox} | ${r.evidenceTokensApprox} | ${r.digestTokensApprox} | ${r.compressionRatio}x | ${r.claimCount} | ${r.signalCount} | ${r.llmInputTokens ?? "N/A"} / ${r.llmOutputTokens ?? "N/A"} | ${r.latencyMs} ms |`
  )
  .join("\n")}

## Evaluation Notes
1. **Fact Budget Verification**: Measures whether stripping filler and grammatical scaffolding from claim-bearing sentences achieves ~150-200 digest tokens without dropping decisive technical claims.
2. **Annotation Matching**: Use \`annotation-template.csv\` to manually verify recall against planted differentiators (held-out plant recall target >= 95%, overall recall >= 90%).
`;
  writeFileSync(join(options.outputDir, "summary.md"), markdownContent, "utf-8");

  // 6. Write annotation-template.csv
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
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Fatal error during extraction audit:", err);
  process.exit(1);
});
