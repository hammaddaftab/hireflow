"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border border-outline-variant bg-surface-container-high px-3 py-1.5 text-xs text-on-surface shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-w-xs",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export interface TooltipProps {
  content?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Shadcn-based accessible Tooltip primitive and standalone helper.
 */
export function Tooltip({
  content,
  children,
  className,
  side = "top",
}: TooltipProps) {
  if (!content && children) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children || (
            <button
              type="button"
              aria-label="More information"
              className="text-on-surface-variant/70 hover:text-on-surface focus:outline-none transition-colors p-0.5 rounded-full inline-flex items-center justify-center cursor-pointer"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className={className}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

export {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
};
