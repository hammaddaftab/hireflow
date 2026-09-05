import type { CompensationBandRequirement } from "@/entities/job";
import type { CandidateSalaryExpectation } from "@/entities/extraction/candidate/aspects/logistics";
import type { EvaluatedCompensationRequirement, CompensationStatus } from "./evaluationStatuses";

function formatSalaryNumber(num: number): string {
  if (num >= 1000000) {
    const val = (num / 1000000).toFixed(1).replace(/\.0$/, "");
    return `${val}M`;
  }
  if (num >= 1000) {
    const val = (num / 1000).toFixed(0);
    return `${val}k`;
  }
  return num.toLocaleString();
}

export type CompensationEvaluatorInput = {
  compensation_requirement: CompensationBandRequirement | null;
  salary_expectation: CandidateSalaryExpectation;
  id?: string;
};

export function evaluateCompensation(input: CompensationEvaluatorInput): EvaluatedCompensationRequirement {
  const { compensation_requirement, salary_expectation, id } = input;
  const band = compensation_requirement || {
    min: 400000,
    max: 600000,
    currency: "PKR",
    blocking: false,
  };
  const isBlocking = Boolean(compensation_requirement?.blocking);
  const norm = salary_expectation.normalized;
  const bandStr = `budget ${formatSalaryNumber(band.min || 0)}–${formatSalaryNumber(band.max || 0)} ${band.currency || "PKR"}`;

  const label = `Max ${formatSalaryNumber(band.max || 0)} ${band.currency || "PKR"}`;

  if (!norm || (norm.min === null && norm.max === null)) {
    return {
      id: id || "req_comp",
      category: "compensation",
      label,
      blocking: isBlocking,
      status: "not_stated",
      evidence_span: salary_expectation.raw,
      reasoning: `Candidate salary expectation not stated (job ${bandStr}).`,
      derived: {
        dotType: "not_stated",
        pillText: label,
        badgeText: "Not Stated",
      },
    };
  }

  const curr = norm.currency || band.currency || "PKR";
  const minVal = norm.min ?? norm.max!;
  const maxVal = norm.max ?? norm.min!;

  const rate = curr === "USD" && band.currency === "PKR" ? 278 : 1;
  const normMinInJobCurrency = minVal * rate;
  const normMaxInJobCurrency = maxVal * rate;

  const statedRange =
    minVal === maxVal
      ? `${formatSalaryNumber(minVal)}`
      : `${formatSalaryNumber(minVal)}–${formatSalaryNumber(maxVal)}`;
  const statedStr = `Candidate stated ${curr} ${statedRange}`;

  let status: CompensationStatus = "confirmed";
  let reasoning = `${statedStr}, within budget of ${bandStr}.`;

  if (band.max !== null && normMinInJobCurrency > band.max) {
    const diff = Math.round((normMinInJobCurrency - band.max) / rate);
    status = "contradicted";
    reasoning = `${statedStr}, which exceeds maximum budget of ${formatSalaryNumber(band.max)} ${band.currency || "PKR"} by ${formatSalaryNumber(diff)} ${curr}.`;
  } else if (band.min !== null && normMaxInJobCurrency < band.min) {
    const diff = Math.round((band.min - normMaxInJobCurrency) / rate);
    status = "ambiguous";
    reasoning = `${statedStr}, below minimum budget range (${formatSalaryNumber(diff)} ${curr} below).`;
  }

  const dotType =
    status === "confirmed"
      ? "confirmed"
      : status === "contradicted"
      ? "contradicted"
      : "gap";
  const pillText = salary_expectation.raw ? `${salary_expectation.raw} stated` : label;
  const badgeText =
    status === "confirmed"
      ? "Confirmed"
      : status === "contradicted"
      ? "Over Budget"
      : "Under Floor";

  return {
    id: id || "req_comp",
    category: "compensation",
    label,
    blocking: isBlocking,
    status,
    evidence_span: salary_expectation.raw,
    reasoning,
    derived: {
      dotType,
      pillText,
      badgeText,
    },
  };
}

