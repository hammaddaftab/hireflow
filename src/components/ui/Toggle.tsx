import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={twMerge(clsx("flex items-start justify-between gap-4", className))}>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={toggleId}
              className={clsx(
                "text-sm font-medium select-none cursor-pointer",
                disabled ? "text-on-surface-variant/50 cursor-not-allowed" : "text-on-surface"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={clsx("text-xs mt-0.5", disabled ? "text-on-surface-variant/50" : "text-on-surface-variant")}>
              {description}
            </p>
          )}
        </div>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          checked ? "bg-primary shadow-[0_0_8px_rgba(245,158,11,0.35)]" : "bg-surface-container-highest",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
