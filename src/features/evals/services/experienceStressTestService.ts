import { generateObject } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import {
  WorkHistoryExtractionSchema,
  type WorkHistoryExtraction,
  type WorkHistoryEntry,
} from "@/entities/extraction/candidate/aspects/workHistory";
import { evaluateExperience } from "@/features/review/core/evaluators/experienceEvaluator";
import type {
  ExperienceTestFixture,
  ExperienceEvalResult,
  ExtractedOccupancyAnalysis,
  EvalDiagnostic,
  BatchEvalSummary,
} from "../types";

// Parses YYYY or YYYY-MM into numeric year and month [1..12]
export function parseDateParts(
  dateStr: string | null | undefined,
  fallbackMonth = 1
): { year: number; month: number } | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  const match = clean.match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = match[2] ? parseInt(match[2], 10) : fallbackMonth;
  return { year, month: Math.min(12, Math.max(1, month)) };
}

// Calculates inclusive calendar months between start and end date
export function computeTenureMonths(
  startDateStr: string,
  endDateStr: string | null,
  isCurrent: boolean
): number {
  const start = parseDateParts(startDateStr, 1);
  if (!start) return 1;

  let end: { year: number; month: number };
  if (isCurrent || !endDateStr) {
    const now = new Date();
    end = { year: now.getFullYear(), month: now.getMonth() + 1 };
  } else {
    end = parseDateParts(endDateStr, 12) || {
      year: start.year,
      month: start.month,
    };
  }

  // Inclusive month calculation: (endYear - startYear) * 12 + (endMonth - startMonth) + 1
  const totalMonths =
    (end.year - start.year) * 12 + (end.month - start.month) + 1;
  return Math.max(1, totalMonths);
}

// Merges overlapping date intervals to calculate deduplicated calendar tenure in months
export function computeDeduplicatedCalendarMonths(
  entries: WorkHistoryEntry[]
): number {
  if (entries.length === 0) return 0;

  type Interval = { startMonthIdx: number; endMonthIdx: number };
  const intervals: Interval[] = [];

  const baseYear = 2000;
  const now = new Date();
  const currentMonthIdx = (now.getFullYear() - baseYear) * 12 + (now.getMonth() + 1);

  for (const entry of entries) {
    const start = parseDateParts(entry.start_date, 1);
    if (!start) continue;

    const startIdx = (start.year - baseYear) * 12 + start.month;
    let endIdx: number;

    if (entry.is_current || !entry.end_date) {
      endIdx = currentMonthIdx;
    } else {
      const end = parseDateParts(entry.end_date, 12);
      endIdx = end ? (end.year - baseYear) * 12 + end.month : startIdx;
    }

    if (endIdx >= startIdx) {
      intervals.push({ startMonthIdx: startIdx, endMonthIdx: endIdx });
    }
  }

  if (intervals.length === 0) return 0;

  // Sort intervals by start month
  intervals.sort((a, b) => a.startMonthIdx - b.startMonthIdx);

  // Merge overlapping or contiguous intervals
  const merged: Interval[] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const prev = merged[merged.length - 1];

    if (current.startMonthIdx <= prev.endMonthIdx + 1) {
      prev.endMonthIdx = Math.max(prev.endMonthIdx, current.endMonthIdx);
    } else {
      merged.push(current);
    }
  }

  return merged.reduce(
    (acc, interval) =>
      acc + (interval.endMonthIdx - interval.startMonthIdx + 1),
    0
  );
}

// Executes live AI extraction for candidate work history using the existing OpenAI configuration
export async function extractWorkHistoryWithOpenAI(
  resumeText: string
): Promise<{
  extraction: WorkHistoryExtraction;
  durationMs: number;
  model: string;
}> {
  const modelInstance = getLanguageModel({ provider: "openai" });
  const modelName = process.env.OPENAI_MODEL || "gpt-5.6-luna";

  const prompt = `Extract each distinct work-history entry from the text below in reverse chronological order.
For each entry:
- entry_id: unique identifier (e.g. 'work_1', 'work_2').
- employer: company or organization name.
- title: job title or role designation.
- start_date: start date formatted as YYYY-MM or YYYY.
- end_date: end date formatted as YYYY-MM or YYYY, or null if currently working here (never return the string "present").
- is_current: true if currently working in this role / ongoing, false otherwise.
- employment_type: an object with:
  * value: 'full_time', 'internship', 'contract', or 'freelance'.
  * status: 'confirmed' if explicitly stated in text (e.g. "Full-time", "Intern"), or 'inferred' if deduced from title or context. Default to 'full_time' unless there is explicit signal indicating otherwise.
- raw_description: original bullet and narrative text kept verbatim.

<text>
${resumeText}
</text>`;

  const startTime = Date.now();
  const { object } = await generateObject({
    model: modelInstance,
    schema: WorkHistoryExtractionSchema,
    prompt,
    abortSignal: AbortSignal.timeout(45000),
  });
  const durationMs = Date.now() - startTime;

  // Normalize any leftover 'present' string in end_date
  for (const entry of object.entries) {
    if (
      entry.end_date &&
      /^(present|current|now|ongoing)$/i.test(entry.end_date.trim())
    ) {
      entry.end_date = null;
      entry.is_current = true;
    }
  }

  return {
    extraction: object,
    durationMs,
    model: modelName,
  };
}

// Runs evaluation for a single fixture and computes deep comparative diagnostics
export async function runExperienceEvaluation(
  fixture: ExperienceTestFixture
): Promise<ExperienceEvalResult> {
  const { extraction, durationMs, model } =
    await extractWorkHistoryWithOpenAI(fixture.resumeText);

  // 1. Run production evaluator logic
  const evaluatorOutput = evaluateExperience({
    requirement: {
      active: true,
      blocking: fixture.targetJobRequirement.blocking,
      years: fixture.targetJobRequirement.minYears,
    },
    candidate: extraction.entries,
  });

  const verifiedYears = evaluatorOutput?.verifiedYears ?? 0;

  // 2. Perform detailed occupancy analysis
  let totalRawMonths = 0;
  const entriesAnalysis: ExtractedOccupancyAnalysis[] = [];
  let fullTimeCount = 0;
  let nonFullTimeCount = 0;

  for (const entry of extraction.entries) {
    const durationMonths = computeTenureMonths(
      entry.start_date,
      entry.end_date,
      entry.is_current
    );
    const durationYears = Math.round((durationMonths / 12) * 10) / 10;
    totalRawMonths += durationMonths;

    const isFullTime = entry.employment_type?.value === "full_time";
    if (isFullTime) {
      fullTimeCount++;
    } else {
      nonFullTimeCount++;
    }

    const exclusionReason = isFullTime
      ? undefined
      : `Excluded from verified experience: categorized as '${entry.employment_type?.value}' (${entry.employment_type?.status})`;

    entriesAnalysis.push({
      entryId: entry.entry_id,
      employer: entry.employer,
      title: entry.title,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current,
      employmentType: entry.employment_type,
      durationMonths,
      durationYears,
      includedInVerified: isFullTime,
      exclusionReason,
      rawDescription: entry.raw_description,
    });
  }

  const extractedTotalRawYears = Math.round((totalRawMonths / 12) * 10) / 10;
  const deduplicatedMonths = computeDeduplicatedCalendarMonths(extraction.entries);
  const calendarDeduplicatedYears = Math.round((deduplicatedMonths / 12) * 10) / 10;

  const deltaVerifiedYears =
    Math.round((verifiedYears - fixture.expected.fullTimeYears) * 10) / 10;
  const deltaTotalYears =
    Math.round((extractedTotalRawYears - fixture.expected.totalYears) * 10) / 10;

  // 3. Diagnose discrepancies
  const diagnostics: EvalDiagnostic[] = [];

  // Check roles count
  if (extraction.entries.length !== fixture.expected.rolesCount) {
    diagnostics.push({
      level: "warning",
      code: "ROLE_COUNT_MISMATCH",
      title: "Extracted Roles Count Mismatch",
      detail: `Expected ${fixture.expected.rolesCount} roles but AI extracted ${extraction.entries.length} distinct occupancies.`,
    });
  }

  // Check non-full-time exclusion impact
  if (nonFullTimeCount > 0) {
    const nonFullTimeMonths = entriesAnalysis
      .filter((e) => !e.includedInVerified)
      .reduce((acc, e) => acc + e.durationMonths, 0);
    const nonFullTimeYears = Math.round((nonFullTimeMonths / 12) * 10) / 10;

    diagnostics.push({
      level: "warning",
      code: "EMPLOYMENT_TYPE_FILTER_IMPACT",
      title: `Full-Time Filter Excluded ${nonFullTimeYears} Years (${nonFullTimeCount} Roles)`,
      detail: `Evaluator omitted ${nonFullTimeCount} non-full-time roles (${nonFullTimeYears} yrs) from verified experience. This is why stated career duration (${extractedTotalRawYears} yrs) differs from verified experience (${verifiedYears} yrs).`,
    });
  }

  // Check overlap impact
  if (totalRawMonths > deduplicatedMonths) {
    const overlapYears =
      Math.round(((totalRawMonths - deduplicatedMonths) / 12) * 10) / 10;
    diagnostics.push({
      level: "info",
      code: "CONCURRENT_OVERLAP_DETECTED",
      title: `Concurrent Roles Overlap: ${overlapYears} Years`,
      detail: `Summing all role durations naively yields ${extractedTotalRawYears} yrs, whereas non-overlapping calendar tenure is ${calendarDeduplicatedYears} yrs.`,
    });
  }

  // Determine overall status
  const isVerifiedAccurate =
    Math.abs(deltaVerifiedYears) <= fixture.toleranceYears;
  const isTotalAccurate = Math.abs(deltaTotalYears) <= fixture.toleranceYears;

  let status: "pass" | "fail" | "warn" = "pass";
  if (!isVerifiedAccurate && !isTotalAccurate) {
    status = "fail";
    diagnostics.push({
      level: "error",
      code: "ACCURACY_DISCREPANCY",
      title: "Extracted Experience Deviates Beyond Tolerance",
      detail: `Extracted verified experience (${verifiedYears} yrs) deviated from expected (${fixture.expected.fullTimeYears} yrs) by ${deltaVerifiedYears} yrs.`,
    });
  } else if (!isVerifiedAccurate || diagnostics.some((d) => d.level === "warning")) {
    status = "warn";
  }

  return {
    fixtureId: fixture.id,
    fixtureTitle: fixture.title,
    timestamp: new Date().toISOString(),
    durationMs,
    model,
    provider: "openai",
    status,
    rawExtraction: extraction,
    evaluatorOutput,
    summary: {
      expectedTotalYears: fixture.expected.totalYears,
      expectedFullTimeYears: fixture.expected.fullTimeYears,
      extractedVerifiedYears: verifiedYears,
      extractedTotalRawYears,
      calendarDeduplicatedYears,
      deltaVerifiedYears,
      deltaTotalYears,
      rolesFound: extraction.entries.length,
      fullTimeRolesCount: fullTimeCount,
      nonFullTimeRolesCount: nonFullTimeCount,
    },
    entries: entriesAnalysis,
    diagnostics,
  };
}

// Runs a batch suite of evaluations across multiple fixtures
export async function runBatchExperienceEvaluation(
  fixtures: ExperienceTestFixture[]
): Promise<BatchEvalSummary> {
  const results: ExperienceEvalResult[] = [];
  let totalMs = 0;

  for (const fixture of fixtures) {
    const res = await runExperienceEvaluation(fixture);
    results.push(res);
    totalMs += res.durationMs;
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const warned = results.filter((r) => r.status === "warn").length;
  const failed = results.filter((r) => r.status === "fail").length;

  const totalDelta = results.reduce(
    (acc, r) => acc + Math.abs(r.summary.deltaVerifiedYears),
    0
  );
  const averageDeltaYears =
    results.length > 0 ? Math.round((totalDelta / results.length) * 100) / 100 : 0;

  const passRate =
    results.length > 0
      ? Math.round(((passed + warned) / results.length) * 100)
      : 0;

  return {
    totalFixtures: fixtures.length,
    passed,
    warned,
    failed,
    passRate,
    averageDeltaYears,
    totalDurationMs: totalMs,
    results,
  };
}
