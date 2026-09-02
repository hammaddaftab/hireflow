import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-on-surface mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={twMerge(
            clsx(
              "w-full px-3 py-2 border rounded-md text-sm text-on-surface bg-surface-container-lowest placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors",
              error
                ? "border-red-500 focus:ring-red-400 focus:border-red-500"
                : "border-outline-variant focus:ring-primary focus:border-primary",
              className
            )
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 font-medium" role="alert">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-on-surface-variant">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
