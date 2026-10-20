import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_EXPERIENCE_FIXTURES } from "../data/defaultFixtures";

export interface SharedEvalInput {
  id: string;
  name: string;
  description?: string;
  resumeText: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  category?: string;
  expected?: {
    experience?: {
      totalYears: number;
      fullTimeYears: number;
      rolesCount: number;
      targetMinYears: number;
      blocking: boolean;
      toleranceYears: number;
    };
    education?: {
      expectedTier?: string;
      expectedInstitutions?: string[];
      expectedFields?: string[];
    };
  };
}

export interface EvalRunOutput {
  id: string;
  inputId: string;
  aspect: "experience" | "education" | "identity";
  status: "pass" | "warn" | "fail" | "completed";
  durationMs: number;
  model: string;
  provider: string;
  createdAt: string;
  summary: Record<string, unknown>;
  diagnostics?: Array<{
    level: "info" | "warning" | "error";
    code: string;
    title: string;
    detail: string;
  }>;
  rawExtraction?: unknown;
  evaluatorOutput?: unknown;
  entries?: unknown[];
  data?: unknown;
}

const DATA_DIR = path.join(process.cwd(), "data", "evals");
const INPUTS_FILE = path.join(DATA_DIR, "inputs.json");
const RUNS_FILE = path.join(DATA_DIR, "runs.json");

// Ensures the data directory exists
async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// Builds initial seed inputs from existing fixtures and presets
function buildInitialSeeds(): SharedEvalInput[] {
  const seeds: SharedEvalInput[] = [];

  // 1. Seed from experience fixtures
  for (const f of DEFAULT_EXPERIENCE_FIXTURES) {
    seeds.push({
      id: f.id,
      name: f.title,
      description: f.description,
      resumeText: f.resumeText,
      createdAt: f.createdAt || new Date().toISOString(),
      updatedAt: f.createdAt || new Date().toISOString(),
      isDefault: true,
      category: f.category,
      expected: {
        experience: {
          totalYears: f.expected.totalYears,
          fullTimeYears: f.expected.fullTimeYears,
          rolesCount: f.expected.rolesCount,
          targetMinYears: f.targetJobRequirement.minYears,
          blocking: f.targetJobRequirement.blocking,
          toleranceYears: f.toleranceYears,
        },
      },
    });
  }

  // 2. Seed from education presets
  seeds.push({
    id: "input-fast-nuces-campus",
    name: "FAST-NUCES Campus Sample",
    description: "BS Computer Science from FAST CFD Campus with FSc Pre-Engineering",
    resumeText: `MUHAMMAD BILAL\nFull Stack Software Engineer\nEmail: bilal@example.com | Phone: +92 300 1234567\n\nEDUCATION\nNational University of Computer and Emerging Sciences (FAST-NUCES CFD Campus)\nBS Computer Science (BSCS)\n2020 - 2024\nGPA: 3.65 / 4.0\n\nGovt College of Science\nFSc Pre-Engineering\n2018 - 2020`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    category: "education_preset",
  });

  seeds.push({
    id: "input-nust-ms-pucit-bs",
    name: "NUST MS + PUCIT BS Sample",
    description: "Ongoing MS Software Engineering at NUST and completed BS IT from PUCIT",
    resumeText: `AYESHA KHAN\nSenior Data Scientist\nEmail: ayesha@example.com\n\nEDUCATION\nNational University of Sciences & Technology (NUST SEECS)\nMS Software Engineering (MSSE)\n2022 - Present\n\nPunjab University College of Information Technology (PUCIT)\nBS Information Technology (BSIT)\n2018 - 2022\nCGPA: 3.8 / 4.0`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    category: "education_preset",
  });

  seeds.push({
    id: "input-bootcamp-intermediate",
    name: "Bootcamp & Intermediate Sample",
    description: "12-week coding bootcamp and ICS diploma, stresses non-degree tier classification",
    resumeText: `HAMZA TARIQ\nJunior Frontend Developer\n\nEDUCATION\n12-Week Intensive Full Stack Web Development Bootcamp\nDevsInc Coding Academy\n2023 - 2023\nTrained in React, Next.js, and TypeScript\n\nPunjab Group of Colleges\nIntermediate (ICS)\n2021 - 2023`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    category: "education_preset",
  });

  return seeds;
}

// Reads all inputs from disk, seeding defaults if missing
export async function getInputs(): Promise<SharedEvalInput[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(INPUTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // File does not exist or invalid JSON, initialize with seeds
  }

  const initial = buildInitialSeeds();
  await fs.writeFile(INPUTS_FILE, JSON.stringify(initial, null, 2), "utf-8");
  return initial;
}

// Saves a new or updated input to disk
export async function saveInput(
  input: Omit<SharedEvalInput, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<SharedEvalInput> {
  const inputs = await getInputs();
  const now = new Date().toISOString();

  const id = input.id || `input-${Date.now()}`;
  const existingIdx = inputs.findIndex((i) => i.id === id);

  const fullInput: SharedEvalInput = {
    ...input,
    id,
    createdAt: input.createdAt || (existingIdx >= 0 ? inputs[existingIdx].createdAt : now),
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    inputs[existingIdx] = fullInput;
  } else {
    inputs.unshift(fullInput);
  }

  await ensureDir();
  await fs.writeFile(INPUTS_FILE, JSON.stringify(inputs, null, 2), "utf-8");
  return fullInput;
}

// Deletes an input and cascades run cleanup
export async function deleteInput(id: string): Promise<boolean> {
  const inputs = await getInputs();
  const filtered = inputs.filter((i) => i.id !== id);
  if (filtered.length === inputs.length) return false;

  await ensureDir();
  await fs.writeFile(INPUTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");

  // Remove runs associated with this input
  try {
    const runs = await getAllRuns();
    const remainingRuns = runs.filter((r) => r.inputId !== id);
    await fs.writeFile(RUNS_FILE, JSON.stringify(remainingRuns, null, 2), "utf-8");
  } catch {
    // Ignore runs cleanup failure
  }

  return true;
}

// Reads all runs from disk
export async function getAllRuns(): Promise<EvalRunOutput[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(RUNS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // File missing or empty
  }
  return [];
}

// Retrieves all runs for a given input ID, optionally filtered by aspect
export async function getRunsForInput(
  inputId: string,
  aspect?: "experience" | "education" | "identity"
): Promise<EvalRunOutput[]> {
  const runs = await getAllRuns();
  return runs.filter(
    (r) => r.inputId === inputId && (!aspect || r.aspect === aspect)
  );
}

// Retrieves the latest run for an input and aspect
export async function getLatestRun(
  inputId: string,
  aspect: "experience" | "education" | "identity"
): Promise<EvalRunOutput | null> {
  const runs = await getRunsForInput(inputId, aspect);
  if (runs.length === 0) return null;
  // Runs are sorted reverse chronological by createdAt
  return runs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

// Retrieves a map of latest runs for every input: inputId -> aspect -> latestRun
export async function getAllLatestRuns(): Promise<
  Record<string, Record<string, EvalRunOutput>>
> {
  const runs = await getAllRuns();
  const map: Record<string, Record<string, EvalRunOutput>> = {};

  for (const run of runs) {
    if (!map[run.inputId]) {
      map[run.inputId] = {};
    }
    const current = map[run.inputId][run.aspect];
    if (
      !current ||
      new Date(run.createdAt).getTime() > new Date(current.createdAt).getTime()
    ) {
      map[run.inputId][run.aspect] = run;
    }
  }

  return map;
}

// Appends or updates a run record permanently to disk
export async function saveRun(
  run: Omit<EvalRunOutput, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  }
): Promise<EvalRunOutput> {
  const runs = await getAllRuns();
  const now = new Date().toISOString();
  const id = run.id || `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const fullRun: EvalRunOutput = {
    ...run,
    id,
    createdAt: run.createdAt || now,
  };

  runs.unshift(fullRun);

  // Keep a maximum of 500 historical runs to avoid unbounded file growth
  const boundedRuns = runs.slice(0, 500);

  await ensureDir();
  await fs.writeFile(RUNS_FILE, JSON.stringify(boundedRuns, null, 2), "utf-8");
  return fullRun;
}
