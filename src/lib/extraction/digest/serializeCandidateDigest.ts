import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { WorkHistoryEntry } from "@/entities/extraction/candidate/aspects/workHistory";
import type { SyntacticTier } from "@/entities/extraction/candidate/aspects/skillsDemonstrated";

export interface SerializeDigestOptions {
  candidateLabel?: string;
  referenceDate?: Date;
}

// Maps syntactic tiers to compact digest tags
function formatTierShort(tier: SyntacticTier | "action_attributed" | "peripheral_action"): string {
  switch (tier) {
    case "action_attributed":
      return "action";
    case "peripheral_action":
      return "peripheral";
    case "context_listed":
      return "listed";
    default:
      return "action";
  }
}

// Parses YYYY or YYYY-MM strings into numeric components
function parseYearMonth(
  d: string | null | undefined,
  fallbackMonth: number
): { year: number; month: number } | null {
  if (!d) return null;
  const match = d.trim().match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: match[2] ? parseInt(match[2], 10) : fallbackMonth,
  };
}

// Computes single role tenure in years
function computeRoleYears(
  entry: WorkHistoryEntry,
  nowYear: number,
  nowMonth: number
): number {
  const start = parseYearMonth(entry.start_date, 1);
  if (!start) return 0;
  const end =
    entry.is_current || !entry.end_date
      ? { year: nowYear, month: nowMonth }
      : parseYearMonth(entry.end_date, 12) || { year: start.year, month: start.month };
  const months = Math.max(1, (end.year * 12 + end.month) - (start.year * 12 + start.month) + 1);
  return Math.round((months / 12) * 10) / 10;
}

// Computes merged non-overlapping full-time years across all full_time roles
function computeMergedFtTenure(
  entries: WorkHistoryEntry[],
  nowYear: number,
  nowMonth: number
): { totalYears: number; ftCount: number; avgYears: number } {
  const ftEntries = entries.filter((e) => e?.employment_type?.value === "full_time");
  if (ftEntries.length === 0) return { totalYears: 0, ftCount: 0, avgYears: 0 };

  const intervals: Array<[number, number]> = [];
  for (const entry of ftEntries) {
    const start = parseYearMonth(entry.start_date, 1);
    if (!start) continue;
    const end =
      entry.is_current || !entry.end_date
        ? { year: nowYear, month: nowMonth }
        : parseYearMonth(entry.end_date, 12) || { year: start.year, month: start.month };
    const startAbs = start.year * 12 + start.month;
    const endAbs = end.year * 12 + end.month;
    if (endAbs >= startAbs) {
      intervals.push([startAbs, endAbs]);
    }
  }

  intervals.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of intervals) {
    if (merged.length === 0 || start > merged[merged.length - 1][1] + 1) {
      merged.push([start, end]);
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
    }
  }

  const totalMonths = merged.reduce((acc, [start, end]) => acc + (end - start + 1), 0);
  const totalYears = Math.round((totalMonths / 12) * 10) / 10;
  const avgYears = ftEntries.length > 0 ? Math.round((totalYears / ftEntries.length) * 10) / 10 : 0;
  return { totalYears, ftCount: ftEntries.length, avgYears };
}

// Formats degree level and field into a clean compact string
function formatDegreeSummary(profile: ParsedCandidateProfile): string | null {
  const entry = profile.education?.entries?.[0];
  if (!entry) return null;

  let degree = entry.degree_level?.normalized || entry.degree_level?.raw || "";
  const field = entry.field?.normalized || entry.field?.raw || "";

  if (/bachelor/i.test(degree)) degree = "BSc";
  else if (/master/i.test(degree)) degree = "MSc";
  else if (/doctorate|phd/i.test(degree)) degree = "PhD";

  let fieldShort = field;
  if (/computer science/i.test(fieldShort)) fieldShort = "CS";
  else if (/software engineering/i.test(fieldShort)) fieldShort = "SE";
  else if (/electrical engineering/i.test(fieldShort)) fieldShort = "EE";

  const degreePart = [degree, fieldShort].filter(Boolean).join(" ");

  let institution = entry.institution?.normalized || entry.institution?.raw || "";
  const rawInst = entry.institution?.raw || "";
  const parenMatch = rawInst.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1].length <= 8) {
    institution = parenMatch[1];
  } else if (/National University of Sciences and Technology/i.test(institution)) {
    institution = "NUST";
  } else if (/FAST|NUCES/i.test(institution)) {
    institution = "FAST";
  } else if (/GIKI/i.test(institution)) {
    institution = "GIKI";
  } else if (/LUMS/i.test(institution)) {
    institution = "LUMS";
  } else if (/UET/i.test(institution)) {
    institution = "UET";
  } else if (institution.length > 25) {
    institution = institution.split(/,|\s+-\s+/)[0].trim();
  }

  let gradeStr = "";
  if (entry.grade) {
    const numMatch = entry.grade.match(/(\d+\.\d+|\d+)/);
    gradeStr = numMatch ? ` (${numMatch[1]})` : ` (${entry.grade.trim()})`;
  }

  const instPart = institution ? ` @ ${institution}` : "";

  return degreePart || instPart ? `${degreePart}${instPart}${gradeStr}`.trim() : null;
}

// Formats logistics into city, salary, notice period
function formatLogisticsSummary(profile: ParsedCandidateProfile): string | null {
  const parts: string[] = [];

  const city =
    profile.identity?.location?.normalized?.city ||
    profile.identity?.location?.raw?.split(/,/)[0]?.trim();
  if (city) parts.push(city);

  const salaryNorm = profile.logistics?.salary_expectation?.normalized;
  if (salaryNorm?.min != null) {
    const curr = salaryNorm.currency || "PKR";
    const amount =
      salaryNorm.min >= 1000 ? `${Math.round(salaryNorm.min / 1000)}k` : `${salaryNorm.min}`;
    parts.push(`${curr} ${amount}`);
  } else if (profile.logistics?.salary_expectation?.raw) {
    parts.push(profile.logistics.salary_expectation.raw);
  }

  const noticeNorm = profile.logistics?.notice_period?.normalized;
  if (noticeNorm?.value != null) {
    const unit =
      noticeNorm.unit === "days"
        ? "d"
        : noticeNorm.unit === "weeks"
        ? "w"
        : noticeNorm.unit === "months"
        ? "m"
        : ` ${noticeNorm.unit}`;
    parts.push(`${noticeNorm.value}${unit} notice`);
  } else if (profile.logistics?.notice_period?.raw) {
    parts.push(`${profile.logistics.notice_period.raw} notice`);
  }

  return parts.length > 0 ? parts.join(", ") : null;
}

// Formats short employer name
function cleanEmployerName(name: string): string {
  return name
    .replace(/\s+(Technologies|Pvt\.?|Ltd\.?|Inc\.?|LLC|Corporation|Software)\b/gi, "")
    .trim();
}

// Serializes a ParsedCandidateProfile into a compact Mechanism E structured digest
export function serializeCandidateDigest(
  profile: ParsedCandidateProfile,
  opts?: SerializeDigestOptions
): string {
  const refDate = opts?.referenceDate || new Date();
  const nowYear = refDate.getFullYear();
  const nowMonth = refDate.getMonth() + 1;

  const label = opts?.candidateLabel || profile.id;
  const entries = profile.work_history?.entries || [];

  // 1. Header line: [cand_id] Tenure | Education | Logistics
  const { totalYears, ftCount, avgYears } = computeMergedFtTenure(entries, nowYear, nowMonth);
  let tenureSummary = "";
  if (ftCount > 1) {
    tenureSummary = `${totalYears}y FT (${ftCount} roles, avg ${avgYears}y)`;
  } else if (ftCount === 1) {
    tenureSummary = `${totalYears}y FT (1 role)`;
  } else if (entries.length > 0) {
    tenureSummary = `${totalYears}y FT`;
  }

  const eduSummary = formatDegreeSummary(profile);
  const logSummary = formatLogisticsSummary(profile);

  const headerSegments = [tenureSummary, eduSummary, logSummary].filter(Boolean);
  const headerLine = `[${label}] ${headerSegments.join(" | ")}`.trim();

  const lines: string[] = [headerLine];

  // Map role claims by source entry ref
  const claimsByEntry = new Map<string, typeof profile.role_claims.claims>();
  for (const claim of profile.role_claims?.claims || []) {
    const list = claimsByEntry.get(claim.source_entry_ref) || [];
    list.push(claim);
    claimsByEntry.set(claim.source_entry_ref, list);
  }

  // 2. Work history entries with nested claims
  entries.forEach((entry, idx) => {
    const employerClean = cleanEmployerName(entry.employer);
    const startYear = entry.start_date ? entry.start_date.slice(0, 4) : "";
    const endYear = entry.is_current || !entry.end_date ? "Pres" : entry.end_date.slice(0, 4);
    const roleYears = computeRoleYears(entry, nowYear, nowMonth);
    const empTypeShort = entry.employment_type?.value === "full_time" ? "FT" : entry.employment_type?.value || "";

    // Detect trivial consecutive promotion (same employer in subsequent entry)
    let promotionPrefix = "";
    const nextEntry = entries[idx + 1];
    if (nextEntry && cleanEmployerName(nextEntry.employer).toLowerCase() === employerClean.toLowerCase()) {
      let prevTitleShort = nextEntry.title;
      if (/Software Engineer/i.test(prevTitleShort)) prevTitleShort = "SWE";
      promotionPrefix = `promoted from ${prevTitleShort}, `;
    }

    const tenureToken = empTypeShort ? `${roleYears}y ${empTypeShort}` : `${roleYears}y`;
    const workHeader = `${entry.entry_id}: ${entry.title} @ ${employerClean} (${promotionPrefix}${startYear}-${endYear}, ${tenureToken})`;
    lines.push(workHeader);

    // Render claims belonging to this entry
    const entryClaims = claimsByEntry.get(entry.entry_id) || [];
    for (const claim of entryClaims) {
      const tierTag = formatTierShort(claim.claim_tier);

      // Union of raw skills and raw_nouns deduped case-insensitively
      const rawSkills = (claim.skills || []).map((s) => s.skill);
      const rawNouns = claim.raw_nouns || [];
      const combinedNouns = [...rawSkills, ...rawNouns];

      const seen = new Set<string>();
      const headerNounList: string[] = [];
      const compactLower = (claim.compact_action || "").toLowerCase();

      for (const n of combinedNouns) {
        const trimmed = n.trim();
        if (!trimmed) continue;
        const lower = trimmed.toLowerCase();
        if (seen.has(lower)) continue;
        seen.add(lower);

        // Omit raw_noun if already embedded in compact_action when skills are present
        if (rawSkills.length > 0 && compactLower.includes(lower)) {
          continue;
        }
        headerNounList.push(trimmed);
      }

      const headerNounsStr = headerNounList.join(", ");
      const actionPart = headerNounsStr ? `${headerNounsStr} -> ${claim.compact_action}` : claim.compact_action;
      const outcomePart = claim.outcome_attached ? ` | ${claim.outcome_attached}` : "";

      lines.push(`  [${claim.claim_id}:${tierTag}] ${actionPart}${outcomePart}`);
    }
  });

  // 3. Spikes (notable non-work signals)
  const signals = profile.notable_signals?.signals || [];
  if (signals.length > 0) {
    lines.push("spikes:");
    for (const signal of signals) {
      const tierTag = formatTierShort(signal.syntactic_tier);
      const prefix = signal.context_label ? `${signal.context_label}: ` : "";
      const nouns = (signal.raw_nouns || []).filter(Boolean).join(", ");
      const action = signal.compact_action || "";
      const outcome = signal.outcome_attached ? ` | ${signal.outcome_attached}` : "";

      const body = nouns ? `${prefix}${nouns} -> ${action}${outcome}` : `${prefix}${action}${outcome}`;
      lines.push(`  [${signal.signal_id}:${tierTag}] ${body}`);
    }
  }

  return lines.join("\n");
}
