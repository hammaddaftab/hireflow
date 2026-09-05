import type { MaxNoticePeriodRequirement } from "@/entities/job";
import type { CandidateNoticePeriod } from "@/entities/extraction/candidate/aspects/logistics";
import type { EvaluatedNoticePeriodRequirement, NoticePeriodStatus } from "./evaluationStatuses";

function noticeToDays(value: number | null, unit: string | null): number | null {
  if (value === null || !unit) return null;
  switch (unit) {
    case "days":
      return value;
    case "weeks":
      return value * 7;
    case "months":
      return value * 30;
    default:
      return value;
  }
}

export type NoticePeriodEvaluatorInput = {
  notice_period_requirement: MaxNoticePeriodRequirement | null;
  notice_period: CandidateNoticePeriod;
  id?: string;
};

export function evaluateNoticePeriod(input: NoticePeriodEvaluatorInput): EvaluatedNoticePeriodRequirement {
  const { notice_period_requirement, notice_period, id } = input;
  const candNotice = notice_period.normalized;
  const isBlocking = Boolean(notice_period_requirement?.blocking);
  const jobMaxDays = noticeToDays(notice_period_requirement?.value ?? null, notice_period_requirement?.unit ?? null);

  let status: NoticePeriodStatus = "not_stated";
  let reasoning = "Candidate did not state a notice period.";

  if (candNotice && candNotice.value !== null && jobMaxDays !== null) {
    const candDays = noticeToDays(candNotice.value, candNotice.unit);
    if (candDays !== null && candDays <= jobMaxDays) {
      status = "confirmed";
      reasoning = `Notice period (${candNotice.value} ${candNotice.unit}) satisfies max requirement (${notice_period_requirement?.value} ${notice_period_requirement?.unit}).`;
    } else {
      status = "contradicted";
      reasoning = `Notice period (${candNotice.value} ${candNotice.unit}) exceeds max requirement (${notice_period_requirement?.value} ${notice_period_requirement?.unit}).`;
    }
  } else if (candNotice && candNotice.value !== null) {
    status = "confirmed";
    reasoning = `Notice period stated: ${candNotice.value} ${candNotice.unit}.`;
  }

  const label = notice_period_requirement?.value
    ? `Notice <= ${notice_period_requirement.value} ${notice_period_requirement.unit}`
    : "Notice Period";

  const dotType =
    status === "confirmed"
      ? "confirmed"
      : status === "contradicted"
      ? "contradicted"
      : "not_stated";
  const pillText = notice_period.raw ? `${notice_period.raw} notice` : label;
  const badgeText =
    status === "confirmed"
      ? "Confirmed"
      : status === "contradicted"
      ? "Exceeds Max"
      : "Not Stated";

  return {
    id: id || "req_notice",
    category: "notice_period",
    label,
    blocking: isBlocking,
    status,
    evidence_span: notice_period.raw,
    reasoning,
    derived: {
      dotType,
      pillText,
      badgeText,
    },
  };
}

