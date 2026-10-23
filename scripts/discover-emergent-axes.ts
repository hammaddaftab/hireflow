// Mechanism E: Emergent Axis Discovery CLI Bench Script
// Discovers pool-relative emergent differentiating axes and calibrated one-by-one scoring rubrics

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import {
  discoverEmergentAxesWithUsage,
  type JobSpecInput,
  type PreSerializedCandidateDigest,
} from "../src/lib/extraction/ranking/discoverEmergentAxes";
import { INITIAL_JOBS } from "../src/db/seeds/jobs";
import { MOCK_CANDIDATES } from "../src/db/seeds/mockCandidates";
import type { AiProvider } from "../src/lib/ai/types";

type PoolSourceMode = "exp1" | "raw" | "mock" | "both";

interface AxesCliOptions {
  inputDir: string;
  rawCvsDir: string;
  outputDir: string;
  source: PoolSourceMode;
  jobKeyOrPath?: string;
  useBudgeted: boolean;
  budget?: number;
  limit?: number;
  skipStage0: boolean;
  provider?: AiProvider;
  model?: string;
  timeoutMs?: number;
}

// Built-in job presets from seeds/jobs.ts and 05-test-bench.md Section 3.2
const BUILTIN_JOBS: Record<string, JobSpecInput> = {
  "go-backend": INITIAL_JOBS[0],
  "grad-ai-swe": {
    id: "job-grad-ai-swe",
    title: "AI / ML & Full-Stack Software Engineer (Graduate / Entry-Level)",
    department: "Applied AI & Product Engineering",
    location: "Islamabad / Lahore, Pakistan",
    seniority_level: "Entry-Level / Junior (0-1 yrs)",
    description:
      "Hiring top graduating BS Computer Science engineers to build production AI/ML systems (LLMs, RAG, computer vision, predictive modeling) and full-stack web/mobile products. All candidates meet the baseline BS CS degree requirement; we seek standout research depth, quantified engineering impact, complex system builds, and selective lab or international experience.",
    min_experience_years: 0,
    skills_required: ["Python", "Machine Learning", "Software Engineering"],
    skills_preferred: ["PyTorch", "TensorFlow", "FastAPI", "RAG", "Computer Vision", "React", "Next.js", "Node.js"],
  },
  "ai-ml-genai": {
    id: "job-ai-ml-genai",
    title: "Senior AI / ML & GenAI Engineer",
    department: "Applied AI",
    location: "Lahore / Islamabad (Hybrid)",
    seniority_level: "Senior",
    description:
      "We are hiring a Senior AI/ML Engineer to architect production LLM and multi-agent RAG pipelines, deploy custom predictive and computer vision models, and drive measurable client and product impact across enterprise workflows.",
    min_experience_years: 3,
    skills_required: ["Python", "LangChain", "RAG", "FastAPI"],
    skills_preferred: ["LangGraph", "AWS Bedrock", "AWS SageMaker", "MLflow", "vLLM", "TensorFlow"],
  },
  "j1-oracle-migration": {
    id: "job-j1-oracle-migration",
    title: "Senior Backend Engineer (Core Database & Legacy Migration)",
    department: "Platform Engineering",
    location: "Islamabad, Pakistan",
    seniority_level: "Senior",
    description:
      "We are moving our core transactional monolith off a legacy Oracle database onto partitioned PostgreSQL and Go microservices without downtime. You will own schema migration, transactional consistency, and query performance.",
    min_experience_years: 4,
    skills_required: ["Go", "PostgreSQL", "Docker", "REST API"],
    skills_preferred: ["Oracle", "Zero-Downtime Migration", "Redis", "Linux"],
  },
  "j2-fintech-compliance": {
    id: "job-j2-fintech-compliance",
    title: "Fintech Settlement & Compliance Backend Engineer",
    department: "Payments & Ledger",
    location: "Karachi / Islamabad",
    seniority_level: "Mid-Senior",
    description:
      "Build high-integrity payment settlement ledgers, idempotent reconciliation workers for Raast/1Link rails, and automated regulatory reporting pipelines.",
    min_experience_years: 4,
    skills_required: ["Go", "PostgreSQL", "REST API", "Docker"],
    skills_preferred: ["Kafka", "gRPC", "Redis", "Financial Ledgers"],
  },
  "j3-high-scale-go": {
    id: "job-j3-high-scale-go",
    title: "High-Scale Go Platform Engineer",
    department: "Core Infrastructure",
    location: "Islamabad, Pakistan",
    seniority_level: "Senior",
    description:
      "Architect ultra-low-latency, high-throughput Go dispatch and routing services sustaining >10,000 requests/sec with strict p99 latency SLAs.",
    min_experience_years: 4,
    skills_required: ["Go", "PostgreSQL", "Docker", "REST API"],
    skills_preferred: ["gRPC", "Apache Kafka", "Kubernetes", "Redis"],
  },
  "j4-voice-ai": {
    id: "job-j4-voice-ai",
    title: "Speech & Voice AI Engineer",
    department: "Voice AI",
    location: "Lahore, Pakistan (Remote)",
    seniority_level: "Mid-Senior",
    description:
      "Build low-latency multilingual and Urdu speech-to-text and conversational voice AI pipelines for regional enterprise customers.",
    min_experience_years: 2,
    skills_required: ["Python", "PyTorch", "FastAPI"],
    skills_preferred: ["Speech-to-Text", "Urdu NLP", "Transformers", "Docker"],
  },
};

// Parses command-line arguments into structured options
function parseArgs(argv: string[]): AxesCliOptions {
  const options: AxesCliOptions = {
    inputDir: resolve("docs/research/top-candidates/bench/exp1-output"),
    rawCvsDir: resolve("docs/research/top-candidates/bench/cvs"),
    outputDir: resolve("docs/research/top-candidates/bench/axes-output"),
    source: "mock",
    useBudgeted: false,
    skipStage0: false,
  };

  let explicitSource = false;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dir" && argv[i + 1]) {
      options.inputDir = resolve(argv[++i]);
      if (!explicitSource) options.source = "exp1";
    } else if (arg === "--raw-dir" && argv[i + 1]) {
      options.rawCvsDir = resolve(argv[++i]);
      if (!explicitSource) options.source = "raw";
    } else if (arg === "--out" && argv[i + 1]) {
      options.outputDir = resolve(argv[++i]);
    } else if (arg === "--source" && argv[i + 1]) {
      const val = argv[++i] as PoolSourceMode;
      if (val === "exp1" || val === "raw" || val === "mock" || val === "both") {
        options.source = val;
        explicitSource = true;
      }
    } else if (arg === "--job" && argv[i + 1]) {
      options.jobKeyOrPath = argv[++i];
    } else if (arg === "--use-budgeted") {
      options.useBudgeted = true;
    } else if (arg === "--budget" && argv[i + 1]) {
      options.budget = parseInt(argv[++i], 10);
    } else if (arg === "--limit" && argv[i + 1]) {
      options.limit = parseInt(argv[++i], 10);
    } else if (arg === "--skip-stage0") {
      options.skipStage0 = true;
    } else if (arg === "--provider" && argv[i + 1]) {
      options.provider = argv[++i] as AiProvider;
    } else if (arg === "--model" && argv[i + 1]) {
      options.model = argv[++i];
    } else if ((arg === "--timeout" || arg === "--timeout-ms") && argv[i + 1]) {
      options.timeoutMs = parseInt(argv[++i], 10);
    }
  }

  return options;
}

// Resolves a JobSpecInput from a preset key, JSON file path, or default for the active source
function resolveJobSpec(options: AxesCliOptions): { jobId: string; job: JobSpecInput } {
  const key = options.jobKeyOrPath;
  if (!key) {
    if (options.source === "exp1" || options.source === "raw") {
      return { jobId: "grad-ai-swe", job: BUILTIN_JOBS["grad-ai-swe"] };
    }
    return { jobId: "go-backend", job: BUILTIN_JOBS["go-backend"] };
  }

  if (BUILTIN_JOBS[key]) {
    return { jobId: key, job: BUILTIN_JOBS[key] };
  }

  const candidatePath = resolve(key);
  if (existsSync(candidatePath)) {
    const raw = JSON.parse(readFileSync(candidatePath, "utf-8")) as JobSpecInput;
    const jobId = raw.id || basename(candidatePath, ".json");
    return { jobId, job: raw };
  }

  throw new Error(
    `Unknown --job preset or missing file '${key}'. Available presets: ${Object.keys(BUILTIN_JOBS).join(", ")}`
  );
}

// Loads pre-serialized digest files and companion .claims.json quote maps from a directory
function loadPreSerializedDigests(
  dirPath: string,
  useBudgeted: boolean
): PreSerializedCandidateDigest[] {
  if (!existsSync(dirPath)) return [];

  const allFiles = readdirSync(dirPath).sort();
  const suffix = useBudgeted ? ".digest.budget.txt" : ".digest.txt";

  const digestFiles = allFiles.filter((f) => {
    if (useBudgeted) {
      return f.endsWith(".digest.budget.txt");
    }
    return f.endsWith(".digest.txt") && !f.endsWith(".digest.budget.txt");
  });

  const loaded: PreSerializedCandidateDigest[] = [];

  for (const file of digestFiles) {
    const candidateId = file.slice(0, -suffix.length);
    const fullDigestPath = join(dirPath, file);
    const digestText = readFileSync(fullDigestPath, "utf-8").trim();
    if (!digestText) continue;

    // Load companion <candidateId>.claims.json if present for O(1) verbatim quote hydration
    const claimsPath = join(dirPath, `${candidateId}.claims.json`);
    const evidenceSpanByRefId: Record<string, string> = {};

    if (existsSync(claimsPath)) {
      try {
        const claimsData = JSON.parse(readFileSync(claimsPath, "utf-8")) as {
          role_claims?: Array<{ claim_id: string; evidence_span?: string }>;
          notable_signals?: Array<{ signal_id: string; evidence_span?: string }>;
        };
        for (const c of claimsData.role_claims || []) {
          if (c.claim_id && c.evidence_span) {
            evidenceSpanByRefId[c.claim_id] = c.evidence_span;
          }
        }
        for (const s of claimsData.notable_signals || []) {
          if (s.signal_id && s.evidence_span) {
            evidenceSpanByRefId[s.signal_id] = s.evidence_span;
          }
        }
      } catch {
        // Ignore malformed claims JSON
      }
    }

    loaded.push({
      candidateId,
      digestText,
      evidenceSpanByRefId,
    });
  }

  return loaded;
}

// Loads raw markdown resumes from bench/cvs for direct Raw-CV vs Digest axis discovery comparison
function loadRawMarkdownResumes(
  dirPath: string,
  limit?: number
): PreSerializedCandidateDigest[] {
  if (!existsSync(dirPath)) return [];

  const mdFiles = readdirSync(dirPath)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort();

  const selected = limit ? mdFiles.slice(0, limit) : mdFiles;
  const loaded: PreSerializedCandidateDigest[] = [];

  for (const file of selected) {
    const candidateId = file.slice(0, -3);
    const rawMd = readFileSync(join(dirPath, file), "utf-8").trim();
    if (!rawMd) continue;

    const nonEmptyLines = rawMd
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l !== "---");

    const numberedLines: string[] = [];
    const evidenceSpanByRefId: Record<string, string> = {};

    nonEmptyLines.forEach((line, idx) => {
      if (idx === 0) {
        numberedLines.push(`[${candidateId}] ${line.replace(/^#\s*/, "")}`);
      } else {
        const refId = `L${idx}`;
        numberedLines.push(`  [${refId}] ${line}`);
        evidenceSpanByRefId[refId] = line.replace(/^[•\-*#]+\s*/, "");
      }
    });

    loaded.push({
      candidateId,
      digestText: numberedLines.join("\n"),
      evidenceSpanByRefId,
    });
  }

  return loaded;
}

async function main() {
  const options = parseArgs(process.argv);
  const { jobId, job } = resolveJobSpec(options);

  console.log("================================================================================");
  console.log("         MECHANISM E: STAGE 1 EMERGENT AXIS DISCOVERY (DISCOVERY ONLY)          ");
  console.log("================================================================================");
  console.log(`Pool Source     : ${options.source}`);
  console.log(`Job Preset/ID   : ${jobId} (${job.title})`);
  if (options.source === "exp1" || options.source === "both") {
    console.log(`Digest Directory: ${options.inputDir} (${options.useBudgeted ? "budgeted" : "uncapped"})`);
  } else if (options.source === "raw") {
    console.log(`Raw CV Directory: ${options.rawCvsDir}`);
  }
  console.log(`Output Directory: ${options.outputDir}`);
  if (options.limit) console.log(`Candidate Limit : ${options.limit}`);
  if (options.provider) console.log(`Provider        : ${options.provider}`);
  if (options.model) console.log(`Model           : ${options.model}`);
  if (options.budget) console.log(`Digest Budget   : ${options.budget} tokens`);
  console.log("--------------------------------------------------------------------------------\n");

  if (!existsSync(options.outputDir)) {
    mkdirSync(options.outputDir, { recursive: true });
  }

  const rawCandidates =
    options.source === "mock" || options.source === "both" ? MOCK_CANDIDATES : [];
  const candidates = options.limit ? rawCandidates.slice(0, options.limit) : rawCandidates;

  let preSerializedDigests: PreSerializedCandidateDigest[] = [];
  if (options.source === "exp1" || options.source === "both") {
    const loaded = loadPreSerializedDigests(options.inputDir, options.useBudgeted);
    preSerializedDigests = options.limit ? loaded.slice(0, options.limit) : loaded;
  } else if (options.source === "raw") {
    preSerializedDigests = loadRawMarkdownResumes(options.rawCvsDir, options.limit);
  }

  const discoveryRes = await discoverEmergentAxesWithUsage({
    job,
    candidates,
    preSerializedDigests,
    skipStage0: options.skipStage0,
    digestTokenBudget: options.budget,
    provider: options.provider,
    model: options.model,
    timeoutMs: options.timeoutMs ?? 0,
  });

  const { result, stage0, poolStats, prompt, warnings, usage, latencyMs } = discoveryRes;

  console.log(
    `Stage 0 Gatekeeper : ${
      stage0.executed
        ? `Executed (${stage0.viableCount} viable / ${stage0.knockedOutCount} knocked out of ${stage0.totalInputCandidates})`
        : `Skipped (${poolStats.contenderCount} contenders loaded)`
    }`
  );
  console.log(
    `Pool Digest Tokens : ~${poolStats.digestsTokensApprox} tokens across ${poolStats.contenderCount} contender(s)`
  );
  console.log(
    `Total Prompt Tokens: ~${poolStats.promptTokensApprox} approx${
      usage?.inputTokens != null ? ` (${usage.inputTokens} LLM in / ${usage.outputTokens} LLM out)` : ""
    } | Latency: ${latencyMs}ms\n`
  );

  console.log(`Pool Summary: ${result.pool_summary}\n`);
  console.log(`Discovered ${result.axes.length} Emergent Differentiating Axes:`);

  for (const axis of result.axes) {
    console.log(`\n  [${axis.axis_id}] ${axis.label} (${axis.category} | ${axis.estimated_pool_prevalence})`);
    console.log(`    Rationale : ${axis.rationale}`);
    console.log(`    Strong    : ${axis.strong_criteria}`);
    console.log(`    Moderate  : ${axis.moderate_criteria}`);
    console.log(
      `    Citations : ${
        axis.supporting_claims.map((c) => `[${c.candidate_id}:${c.ref_id}]`).join(", ") || "none"
      }`
    );
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const w of warnings) {
      console.log(`  - ${w}`);
    }
  }

  const modeLabel =
    options.source === "exp1" && options.useBudgeted ? "exp1-budgeted" : options.source;
  const runPrefix = `${modeLabel}-${jobId}`;

  // 1. Write <runPrefix>.axes.json
  const jsonPath = join(options.outputDir, `${runPrefix}.axes.json`);
  const jsonPayload = {
    job_id: jobId,
    job_title: job.title,
    source_mode: options.source,
    stage0,
    pool_stats: poolStats,
    pool_summary: result.pool_summary,
    axes: result.axes,
    warnings,
    usage: usage || null,
    latency_ms: latencyMs,
  };
  writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), "utf-8");

  // 2. Write <runPrefix>.prompt.txt
  const promptPath = join(options.outputDir, `${runPrefix}.prompt.txt`);
  writeFileSync(promptPath, prompt, "utf-8");

  // 3. Write <runPrefix>.axes.md
  const mdPath = join(options.outputDir, `${runPrefix}.axes.md`);
  const mdContent = `# Mechanism E: Emergent Axis Discovery Report (\`${runPrefix}\`)

## Run Configuration
- **Job**: ${job.title} (\`${jobId}\`)
- **Pool Source**: \`${options.source}\`
- **Stage 0 Gatekeeper**: ${
    stage0.executed
      ? `Executed — **${stage0.viableCount}** viable contenders retained, **${stage0.knockedOutCount}** knocked out`
      : `Not executed (pre-filtered or custom job spec)`
  }
- **Contenders in Prompt**: ${poolStats.contenderCount}
- **Approximate Tokens**: Job Spec ~${poolStats.jobSpecTokensApprox}t | Candidate Digests ~${poolStats.digestsTokensApprox}t | Full Prompt ~${poolStats.promptTokensApprox}t
- **Provider Token Usage**: ${
    usage?.inputTokens != null
      ? `${usage.inputTokens} input / ${usage.outputTokens} output (${usage.totalTokens} total)`
      : "N/A"
  }
- **Latency**: ${latencyMs} ms

${
  stage0.knockedOutCandidates.length > 0
    ? `## Stage 0 Knockouts (Excluded Before Axis Discovery)
| Candidate ID | Name | Blocking Contradictions |
|---|---|---|
${stage0.knockedOutCandidates
  .map(
    (k) =>
      `| \`${k.candidateId}\` | ${k.candidateName} | ${k.contradictions
        .map((c) => `**${c.label}**: ${c.reasoning}`)
        .join("; ")} |`
  )
  .join("\n")}
`
    : ""
}
## Pool Summary
> ${result.pool_summary}

## Discovered Emergent Differentiating Axes (${result.axes.length})

${result.axes
  .map(
    (axis) => `### ${axis.axis_id}: ${axis.label}
- **Category**: \`${axis.category}\`
- **Estimated Pool Prevalence**: ${axis.estimated_pool_prevalence}
- **Rationale**: ${axis.rationale}
- **One-by-One Scoring Rubric**:
  - **Strong**: ${axis.strong_criteria}
  - **Moderate**: ${axis.moderate_criteria}
- **Supporting Pool Citations ($O(1)$ Hydrated)**:
${
  axis.supporting_claims.length > 0
    ? axis.supporting_claims
        .map(
          (c) =>
            `  - \`[${c.candidate_id}:${c.ref_id}]\` Digest: \`${c.digest_line || "N/A"}\`${
              c.evidence_span ? `\n    - *Verbatim Quote*: "${c.evidence_span}"` : ""
            }`
        )
        .join("\n")
    : "  - None"
}`
  )
  .join("\n\n")}
`;
  writeFileSync(mdPath, mdContent, "utf-8");

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`Artifacts written to: ${options.outputDir}`);
  console.log(`  - ${runPrefix}.axes.json`);
  console.log(`  - ${runPrefix}.axes.md`);
  console.log(`  - ${runPrefix}.prompt.txt`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Fatal error during emergent axis discovery:", err);
  process.exit(1);
});
