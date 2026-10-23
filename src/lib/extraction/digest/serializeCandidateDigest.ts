import type { ParsedCandidateProfile } from "@/entities/candidate";
import type { WorkHistoryEntry } from "@/entities/extraction/candidate/aspects/workHistory";
import type { SyntacticTier } from "@/entities/extraction/candidate/aspects/skillsDemonstrated";

export interface SerializeDigestOptions {
  candidateLabel?: string;
  referenceDate?: Date;
  tokenBudget?: number;
}

export interface DigestSerializationResult {
  text: string;
  approxTokens: number;
  totalItems: number;
  keptItems: number;
  droppedItemIds: string[];
  tokenBreakdown: {
    headers: number;
    nouns: number;
    actions: number;
    outcomes: number;
  };
}

// Approximate token counter using standard characters/4 heuristic
export function approxTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
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
    let cleanGrade = entry.grade.trim();
    // Clean up noisy grade strings like "Result Awaited [Grade A expected]" -> "Grade A expected"
    cleanGrade = cleanGrade.replace(/^Result Awaited\s*\[(.*)\]$/i, "$1").replace(/[\][]/g, "").trim();
    // Avoid double parentheses
    cleanGrade = cleanGrade.replace(/^\((.*)\)$/, "$1").trim();
    if (cleanGrade) {
      gradeStr = ` (${cleanGrade})`;
    }
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

// Cleans and abbreviates role titles according to Spec 04 Section 5
export function cleanRoleTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(
      /\s*\((?:Volunteer|Part-Time[^)]*|Full-Time[^)]*|Contract[^)]*|Intern(?:ship)?[^)]*)\)/gi,
      ""
    )
    .replace(/\bSenior\b/gi, "Sr")
    .replace(/\bJunior\b/gi, "Jr")
    .replace(/\bGenerative AI\b/gi, "GenAI")
    .replace(/\bArtificial Intelligence\b/gi, "AI")
    .replace(/\bMachine Learning\b/gi, "ML")
    .replace(/\bData Scientist\b/gi, "DS")
    .replace(/\bData Science\b/gi, "DS")
    .replace(/\bSoftware Engineer(?:ing)?\b/gi, "SWE")
    .replace(/\bEngineer(?:ing)?\b/gi, "Eng")
    .replace(/\bDeveloper\b/gi, "Dev")
    .replace(/\s+/g, " ")
    .trim();
}

// Formats compacted nouns: deduplicates, removes nouns present in compact_action, and groups cloud vendor prefixes
function formatCompactedNouns(items: string[], compactAction: string): string {
  const seen = new Set<string>();
  const deduped: string[] = [];
  const actionLower = (compactAction || "").toLowerCase();

  for (const raw of items) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    if (actionLower.includes(lower)) continue;
    deduped.push(trimmed);
  }

  const vendors = ["AWS", "GCP", "Azure"];
  let workingList = [...deduped];

  for (const vendor of vendors) {
    const vendorLower = vendor.toLowerCase();
    const prefixRegex = new RegExp(`^${vendor}\\s+(.+)$`, "i");

    // Check if any specific service exists with this vendor prefix
    const hasSpecificService = workingList.some((item) => prefixRegex.test(item));

    if (hasSpecificService) {
      // Omit bare vendor name
      workingList = workingList.filter((item) => item.toLowerCase() !== vendorLower);

      // Collect all services matching this prefix
      const matchingIndices: number[] = [];
      const subServices: string[] = [];

      workingList.forEach((item, idx) => {
        const match = item.match(prefixRegex);
        if (match) {
          matchingIndices.push(idx);
          subServices.push(match[1].trim());
        }
      });

      // Group if 2 or more services
      if (matchingIndices.length >= 2) {
        const firstIdx = matchingIndices[0];
        const groupedStr = `${vendor} (${subServices.join(", ")})`;

        const newList: string[] = [];
        workingList.forEach((item, idx) => {
          if (idx === firstIdx) {
            newList.push(groupedStr);
          } else if (!matchingIndices.includes(idx)) {
            newList.push(item);
          }
        });
        workingList = newList;
      }
    }
  }

  return workingList.join(", ");
}

interface InternalDigestItem {
  id: string;
  coveredIds: string[];
  kind: "role_claim" | "notable_signal";
  roleEntryId?: string;
  hasOutcome: number;
  tierScore: number;
  recencyScore: number;
  nounCount: number;
  originalIndex: number;
  renderedLine: string;
  nounPart: string;
  actionPart: string;
  outcomePart: string;
}

// Compares candidate digest items for greedy budget selection
function compareDigestItems(a: InternalDigestItem, b: InternalDigestItem): number {
  // 1. Has outcome_attached (1 vs 0) descending
  if (b.hasOutcome !== a.hasOutcome) {
    return b.hasOutcome - a.hasOutcome;
  }
  // 2. Syntactic tier (3 vs 2 vs 1) descending
  if (b.tierScore !== a.tierScore) {
    return b.tierScore - a.tierScore;
  }
  // 3. Recency of work role descending
  if (b.recencyScore !== a.recencyScore) {
    return b.recencyScore - a.recencyScore;
  }
  // 4. Count of specific nouns/skills (capped at 4) descending
  if (b.nounCount !== a.nounCount) {
    return b.nounCount - a.nounCount;
  }
  // 5. Original order ascending
  return a.originalIndex - b.originalIndex;
}

// Serializes a ParsedCandidateProfile into a compact Mechanism E structured digest with budget and stats
export function serializeCandidateDigestWithStats(
  profile: ParsedCandidateProfile,
  opts?: SerializeDigestOptions
): DigestSerializationResult {
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

  // Pre-compute work history role headers
  const roleHeadersByEntryId = new Map<string, string>();
  entries.forEach((entry, idx) => {
    const employerClean = cleanEmployerName(entry.employer);
    const roleTitleClean = cleanRoleTitle(entry.title);
    const startYear = entry.start_date ? entry.start_date.slice(0, 4) : "";
    const endYear = entry.is_current || !entry.end_date ? "Pres" : entry.end_date.slice(0, 4);
    const roleYears = computeRoleYears(entry, nowYear, nowMonth);
    const empTypeShort =
      entry.employment_type?.value === "full_time" ? "FT" : entry.employment_type?.value || "";

    let promotionPrefix = "";
    const nextEntry = entries[idx + 1];
    if (nextEntry && cleanEmployerName(nextEntry.employer).toLowerCase() === employerClean.toLowerCase()) {
      const prevTitleShort = cleanRoleTitle(nextEntry.title);
      promotionPrefix = `promoted from ${prevTitleShort}, `;
    }

    const tenureToken = empTypeShort ? `${roleYears}y ${empTypeShort}` : `${roleYears}y`;
    const workHeader = `${entry.entry_id}: ${roleTitleClean} @ ${employerClean} (${promotionPrefix}${startYear}-${endYear}, ${tenureToken})`;
    roleHeadersByEntryId.set(entry.entry_id, workHeader);
  });

  // Build role claim items
  const allItems: InternalDigestItem[] = [];
  let itemSequence = 0;

  const rawRoleClaims = profile.role_claims?.claims || [];
  rawRoleClaims.forEach((claim) => {
    const tierTag = formatTierShort(claim.claim_tier);
    const combinedNouns = [
      ...(claim.skills || []).map((s) => s.skill),
      ...(claim.raw_nouns || []),
    ];
    const nounsStr = formatCompactedNouns(combinedNouns, claim.compact_action || "");
    const actionPart = claim.compact_action || "";
    const outcomePart = claim.outcome_attached ? ` | ${claim.outcome_attached}` : "";

    const renderedLine = nounsStr
      ? `  [${claim.claim_id}:${tierTag}] ${nounsStr} -> ${actionPart}${outcomePart}`
      : `  [${claim.claim_id}:${tierTag}] ${actionPart}${outcomePart}`;

    const roleIndex = entries.findIndex((e) => e.entry_id === claim.source_entry_ref);
    const effectiveRoleIndex = roleIndex >= 0 ? roleIndex : 99;
    const recencyScore = Math.max(0, 1000 - effectiveRoleIndex * 100);

    const tierScore =
      claim.claim_tier === "action_attributed" ? 3 : claim.claim_tier === "peripheral_action" ? 2 : 1;

    allItems.push({
      id: claim.claim_id,
      coveredIds: [claim.claim_id],
      kind: "role_claim",
      roleEntryId: claim.source_entry_ref,
      hasOutcome: claim.outcome_attached ? 1 : 0,
      tierScore,
      recencyScore,
      nounCount: Math.min(4, (claim.skills?.length || 0) + (claim.raw_nouns?.length || 0)),
      originalIndex: itemSequence++,
      renderedLine,
      nounPart: nounsStr ? `${nounsStr} -> ` : "",
      actionPart: `  [${claim.claim_id}:${tierTag}] ${actionPart}`,
      outcomePart,
    });
  });

  // Build notable signal items, merging multiple certification signals if present
  const rawSignals = profile.notable_signals?.signals || [];
  const certSignals = rawSignals.filter((s) => /certif/i.test(s.context_label));
  const nonCertSignals = rawSignals.filter((s) => !/certif/i.test(s.context_label));

  for (const signal of nonCertSignals) {
    const tierTag = formatTierShort(signal.syntactic_tier);
    const prefix = signal.context_label ? `${signal.context_label}: ` : "";
    const nounsStr = formatCompactedNouns(signal.raw_nouns || [], signal.compact_action || "");
    const actionPart = signal.compact_action || "";
    const outcomePart = signal.outcome_attached ? ` | ${signal.outcome_attached}` : "";

    const body = nounsStr ? `${prefix}${nounsStr} -> ${actionPart}` : `${prefix}${actionPart}`;
    const renderedLine = `  [${signal.signal_id}:${tierTag}] ${body}${outcomePart}`;

    const tierScore = signal.syntactic_tier === "action_attributed" ? 3 : 2;

    allItems.push({
      id: signal.signal_id,
      coveredIds: [signal.signal_id],
      kind: "notable_signal",
      hasOutcome: signal.outcome_attached ? 1 : 0,
      tierScore,
      recencyScore: 950,
      nounCount: Math.min(4, signal.raw_nouns?.length || 0),
      originalIndex: itemSequence++,
      renderedLine,
      nounPart: nounsStr ? `${nounsStr} -> ` : "",
      actionPart: `  [${signal.signal_id}:${tierTag}] ${prefix}${actionPart}`,
      outcomePart,
    });
  }

  // Handle certifications (merged into one line if multiple exist)
  if (certSignals.length > 0) {
    const primaryCert = certSignals[0];
    const tierTag = formatTierShort(primaryCert.syntactic_tier);
    const joinedActions = certSignals
      .map((s) => s.compact_action || s.raw_nouns?.join("; "))
      .filter(Boolean)
      .join("; ");
    const certOutcome = certSignals.find((s) => s.outcome_attached)?.outcome_attached;
    const outcomePart = certOutcome ? ` | ${certOutcome}` : "";

    const renderedLine = `  [${primaryCert.signal_id}:${tierTag}] Certs: ${joinedActions}${outcomePart}`;
    const coveredIds = certSignals.map((s) => s.signal_id);

    allItems.push({
      id: primaryCert.signal_id,
      coveredIds,
      kind: "notable_signal",
      hasOutcome: certOutcome ? 1 : 0,
      tierScore: 3,
      recencyScore: 950,
      nounCount: 0,
      originalIndex: itemSequence++,
      renderedLine,
      nounPart: "",
      actionPart: `  [${primaryCert.signal_id}:${tierTag}] Certs: ${joinedActions}`,
      outcomePart,
    });
  }

  // Pure digest rendering helper given a set of kept item IDs
  const renderDigestWithKeptItems = (
    keptIds: Set<string>,
    isBudgeted: boolean
  ): {
    text: string;
    tokenBreakdown: { headers: number; nouns: number; actions: number; outcomes: number };
  } => {
    const lines: string[] = [headerLine];
    let headerTokens = approxTokens(headerLine);
    let nounTokens = 0;
    let actionTokens = 0;
    let outcomeTokens = 0;

    // Work history entries with nested claims
    entries.forEach((entry) => {
      const roleClaims = allItems.filter(
        (i) => i.kind === "role_claim" && i.roleEntryId === entry.entry_id && keptIds.has(i.id)
      );

      // In budgeted mode, omit role header if no claims from this role were kept
      if (isBudgeted && roleClaims.length === 0) {
        return;
      }

      const roleHeader = roleHeadersByEntryId.get(entry.entry_id) || entry.entry_id;
      lines.push(roleHeader);
      headerTokens += approxTokens(roleHeader);

      for (const item of roleClaims) {
        lines.push(item.renderedLine);
        nounTokens += approxTokens(item.nounPart);
        actionTokens += approxTokens(item.actionPart);
        outcomeTokens += approxTokens(item.outcomePart);
      }
    });

    // Spikes section
    const keptSignals = allItems.filter(
      (i) => i.kind === "notable_signal" && keptIds.has(i.id)
    );

    if (keptSignals.length > 0) {
      lines.push("spikes:");
      headerTokens += approxTokens("spikes:");
      for (const item of keptSignals) {
        lines.push(item.renderedLine);
        nounTokens += approxTokens(item.nounPart);
        actionTokens += approxTokens(item.actionPart);
        outcomeTokens += approxTokens(item.outcomePart);
      }
    }

    return {
      text: lines.join("\n"),
      tokenBreakdown: {
        headers: headerTokens,
        nouns: nounTokens,
        actions: actionTokens,
        outcomes: outcomeTokens,
      },
    };
  };

  const totalProfileItems =
    (profile.role_claims?.claims?.length || 0) + (profile.notable_signals?.signals?.length || 0);

  // Baseline rendering with all items kept
  const allItemIds = new Set(allItems.map((i) => i.id));
  const isBudgeted = Boolean(opts?.tokenBudget);
  const uncappedResult = renderDigestWithKeptItems(allItemIds, isBudgeted);
  const uncappedTokens = approxTokens(uncappedResult.text);

  // If no tokenBudget is specified or uncapped fits within budget, return uncapped
  if (!opts?.tokenBudget || uncappedTokens <= opts.tokenBudget) {
    return {
      text: uncappedResult.text,
      approxTokens: uncappedTokens,
      totalItems: totalProfileItems,
      keptItems: totalProfileItems,
      droppedItemIds: [],
      tokenBreakdown: uncappedResult.tokenBreakdown,
    };
  }

  // Budget exceeded: greedy inclusion in priority order
  const prioritySortedItems = [...allItems].sort(compareDigestItems);
  const activeKeptIds = new Set<string>();

  for (const candidateItem of prioritySortedItems) {
    const testSet = new Set([...activeKeptIds, candidateItem.id]);
    const testDigest = renderDigestWithKeptItems(testSet, true);
    if (approxTokens(testDigest.text) <= opts.tokenBudget) {
      activeKeptIds.add(candidateItem.id);
    }
  }

  // Final budgeted render in original chronological order
  const finalResult = renderDigestWithKeptItems(activeKeptIds, true);
  const droppedIds: string[] = [];

  for (const item of allItems) {
    if (!activeKeptIds.has(item.id)) {
      droppedIds.push(...item.coveredIds);
    }
  }

  return {
    text: finalResult.text,
    approxTokens: approxTokens(finalResult.text),
    totalItems: totalProfileItems,
    keptItems: totalProfileItems - droppedIds.length,
    droppedItemIds: droppedIds,
    tokenBreakdown: finalResult.tokenBreakdown,
  };
}

// Serializes a ParsedCandidateProfile into a compact Mechanism E structured digest
export function serializeCandidateDigest(
  profile: ParsedCandidateProfile,
  opts?: SerializeDigestOptions
): string {
  return serializeCandidateDigestWithStats(profile, opts).text;
}
