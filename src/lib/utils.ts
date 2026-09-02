import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Extended tailwind-merge configuration recognizing Google Material Design 3
 * typography scales and semantic color roles.
 */
export const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-headline-large",
        "text-headline-medium",
        "text-headline-small",
        "text-title-large",
        "text-title-medium",
        "text-title-small",
        "text-body-large",
        "text-body-medium",
        "text-body-small",
        "text-label-large",
        "text-label-medium",
        "text-label-small",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
