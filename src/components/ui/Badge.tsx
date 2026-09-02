import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "primary-container"
    | "dealbreaker"
    | "soft"
    | "success"
    | "warning"
    | "neutral"
    | "high"
    | "highest";
  onRemove?: () => void;
  removeAriaLabel?: string;
}

export function Badge({
  children,
  className,
  variant = "default",
  onRemove,
  removeAriaLabel = "Remove tag",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-container-high text-on-surface border-outline-variant",
    primary: "bg-primary text-on-primary border-primary font-semibold shadow-xs",
    "primary-container": "bg-primary-container text-on-primary-container border-outline-variant font-semibold shadow-xs",
    dealbreaker: "bg-red-50 text-red-700 border-red-200 font-semibold",
    soft: "bg-surface-container text-on-surface-variant border-outline-variant",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-primary-container text-on-primary-container border-outline-variant font-semibold shadow-xs",
    neutral: "bg-surface-container-low text-on-surface-variant border-outline-variant",
    high: "bg-surface-container-high text-on-surface border-outline-variant shadow-xs",
    highest: "bg-surface-container-highest text-on-surface font-semibold border-outline shadow-xs",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border font-medium",
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={removeAriaLabel}
          className="hover:opacity-75 focus:outline-none -mr-1 p-0.5 rounded-full"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
