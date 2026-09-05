import type { WorkModeRequirement } from "@/entities/job";
import type { EvaluatedWorkModeRequirement, WorkModeStatus } from "./evaluationStatuses";

export type WorkModeEvaluatorInput = {
  work_mode_requirement: WorkModeRequirement | null;
  stated_relocation_willingness?: string | null;
  id?: string;
};

export function evaluateWorkMode(input: WorkModeEvaluatorInput): EvaluatedWorkModeRequirement {
  const { work_mode_requirement, stated_relocation_willingness, id } = input;
  const isBlocking = Boolean(work_mode_requirement?.blocking);
  const mode = work_mode_requirement?.mode || "flexible";

  let status: WorkModeStatus = "confirmed";
  let reasoning = `Role operates in ${mode} mode.`;

  if (mode === "remote") {
    status = "confirmed";
    reasoning = "Remote role, fully flexible for candidate location.";
  } else if (stated_relocation_willingness === "unwilling") {
    status = "contradicted";
    reasoning = `Role requires ${mode} presence, but candidate stated unwilling to relocate.`;
  } else if (!stated_relocation_willingness || stated_relocation_willingness === "not_stated") {
    status = "ambiguous";
    reasoning = `Role requires ${mode} presence; relocation willingness is not stated.`;
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

  return {
    id: id || "req_work_mode",
    category: "work_mode",
    label: pillText,
    blocking: isBlocking,
    status,
    evidence_span: stated_relocation_willingness ? `Relocation: ${stated_relocation_willingness}` : null,
    reasoning,
    derived: {
      dotType,
      pillText,
      badgeText,
    },
  };
}

