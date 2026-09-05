import type { EvidentiaryDotType } from "../evaluators/evaluationStatuses";

/**
 * Maps evidentiary dot types to Tailwind pill background, text, and border styles.
 */
export function getPillStyles(status: EvidentiaryDotType): string {
  switch (status) {
    case "confirmed":
      return "bg-blue-50/90 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border-blue-200/90 dark:border-blue-800/60";
    case "gap":
      return "bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-200/90 dark:border-amber-800/60";
    case "contradicted":
      return "bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-rose-200/90 dark:border-rose-800/60";
    case "not_stated":
    default:
      return "bg-surface-container/40 text-on-surface-variant border-dashed border-outline-variant/60";
  }
}

/**
 * Maps evidentiary dot types to badge pill container background and text styles.
 */
export function getBadgeStyles(variant: EvidentiaryDotType): string {
  switch (variant) {
    case "confirmed":
      return "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold";
    case "contradicted":
      return "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold";
    case "gap":
    case "not_stated":
    default:
      return "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold";
  }
}

/**
 * Normalizes arbitrary requirement evaluation statuses to canonical evidentiary dot types.
 */
export function getEvidentiaryDotType(status: string): EvidentiaryDotType {
  switch (status) {
    case "confirmed":
      return "confirmed";
    case "contradicted":
      return "contradicted";
    case "ambiguous":
    case "inferred":
      return "gap";
    case "not_stated":
    case "unparseable":
    default:
      return "not_stated";
  }
}

/**
 * Maps status strings to semantic label text color styles.
 */
export function getStatusTextColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "text-on-surface font-semibold";
    case "contradicted":
      return "text-rose-700 dark:text-rose-400 font-semibold";
    case "ambiguous":
    case "inferred":
      return "text-amber-700 dark:text-amber-300 font-semibold";
    case "not_stated":
    case "unparseable":
    default:
      return "text-on-surface-variant";
  }
}

