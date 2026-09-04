import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      disabled,
      isLoading = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md shrink-0";

    const variantStyles = {
      primary: "bg-primary text-on-primary hover:bg-primary-hover focus-visible:ring-primary shadow-xs",
      secondary: "bg-surface-container-highest text-on-surface hover:bg-surface-container-high focus-visible:ring-primary shadow-xs",
      outline: "border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface focus-visible:ring-primary shadow-xs",
      danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-xs",
      ghost: "bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface focus-visible:ring-primary",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
        {...props}
      >
        {isLoading && (
          <span
            data-testid="loading-spinner"
            className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full shrink-0"
          />
        )}
        {!isLoading && icon && iconPosition === "left" && (
          <span className="shrink-0 inline-flex items-center" data-testid="button-icon-left">
            {icon}
          </span>
        )}
        {children}
        {!isLoading && icon && iconPosition === "right" && (
          <span className="shrink-0 inline-flex items-center" data-testid="button-icon-right">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
