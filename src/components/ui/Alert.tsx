import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const styles = {
    info: {
      container: "bg-amber-50/80 border-amber-200 text-amber-950",
      icon: <Info className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />,
      titleColor: "text-amber-950",
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />,
      titleColor: "text-emerald-900",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />,
      titleColor: "text-amber-900",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-900",
      icon: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden="true" />,
      titleColor: "text-red-900",
    },
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          "flex items-start gap-3 p-4 border rounded-md transition-all text-sm",
          current.container,
          className
        )
      )}
    >
      <span data-testid={`alert-icon-${variant}`}>{current.icon}</span>
      <div className="flex-1">
        {title && <h4 className={clsx("font-semibold mb-1", current.titleColor)}>{title}</h4>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close alert"
          className="p-1 -mr-1 -mt-1 text-on-surface-variant hover:text-on-surface rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
