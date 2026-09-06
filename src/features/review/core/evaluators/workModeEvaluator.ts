import type { WorkModeRequirement, LocationRequirement } from "@/entities/job";
import type { NormalizedLocation } from "@/entities/extraction/candidate/aspects/identity";
import type {
  EvaluatedWorkModeRequirement,
  WorkModeStatus,
  EvaluationPair,
} from "./evaluationStatuses";

export interface CandidateWorkModeContext {
  normalized_location?: NormalizedLocation | null;
  stated_relocation_willingness?: string | null;
  target_location?: LocationRequirement | null;
}

export type WorkModeEvaluatorInput = EvaluationPair<
  WorkModeRequirement,
  CandidateWorkModeContext
>;

export function evaluateWorkMode(
  input: WorkModeEvaluatorInput,
  id?: string
): EvaluatedWorkModeRequirement | null {
  const { requirement: work_mode_requirement, candidate } = input;

  // Invariant: If criterion is not active, omit completely
  if (work_mode_requirement.active === false) {
    return null;
  }

  const {
    stated_relocation_willingness,
    target_location: location_requirement,
    normalized_location,
  } = candidate;

  const isBlocking = Boolean(work_mode_requirement.blocking);
  const mode = work_mode_requirement.mode;

  const reqCity = (location_requirement?.active ? location_requirement.city?.toLowerCase() : null) || null;
  const reqProvince = (location_requirement?.active ? location_requirement.province?.toLowerCase() : null) || null;
  const candCity = normalized_location?.normalized?.city?.toLowerCase() || null;
  const candProvince = normalized_location?.normalized?.province?.toLowerCase() || null;

  // Check if candidate is already located in the target jurisdiction
  const isLocalMatch = Boolean(
    (reqCity && candCity && reqCity === candCity) ||
    (!reqCity && reqProvince && candProvince && reqProvince === candProvince)
  );

  let status: WorkModeStatus = "confirmed";
  let reasoning = `Role operates in ${mode} mode.`;

  if (mode === "remote") {
    status = "confirmed";
    reasoning = "Remote role, fully flexible for candidate location.";
  } else if (isLocalMatch) {
    status = "confirmed";
    const locDisplay = candCity ? candCity.charAt(0).toUpperCase() + candCity.slice(1) : candProvince || "target area";
    reasoning = `Role requires ${mode} presence. Candidate is already located in ${locDisplay}.`;
  } else if (stated_relocation_willingness === "willing") {
    status = "confirmed";
    reasoning = `Role requires ${mode} presence. Candidate located in ${candCity || "different location"}, but stated willing to relocate.`;
  } else if (stated_relocation_willingness === "unwilling") {
    status = "contradicted";
    reasoning = `Role requires ${mode} presence, but candidate stated unwilling to relocate.`;
  } else {
    status = "ambiguous";
    const targetLoc = [location_requirement?.city, location_requirement?.province].filter(Boolean).join(", ");
    reasoning = `Role requires ${mode} presence in ${targetLoc || "specified location"}; candidate is in ${candCity || "different location"} and relocation willingness is not stated.`;
  }

  const dotType =
    status === "confirmed"
      ? "confirmed"
      : status === "contradicted"
      ? "contradicted"
      : "gap";
  const pillText = `Work Mode: ${mode}`;
  const badgeText =
    status === "confirmed"
      ? "Confirmed"
      : status === "contradicted"
      ? "Contradicted"
      : "Ambiguous";

  const evidenceSpan = isLocalMatch
    ? normalized_location?.raw || (candCity ? `Location: ${candCity}` : null)
    : stated_relocation_willingness
    ? `Relocation: ${stated_relocation_willingness}`
    : normalized_location?.raw || null;

  return {
    id: id || "req_work_mode",
    category: "work_mode",
    label: pillText,
    blocking: isBlocking,
    status,
    evidence_span: evidenceSpan,
    reasoning,
    derived: {
      dotType,
      pillText,
      badgeText,
    },
  };
}

