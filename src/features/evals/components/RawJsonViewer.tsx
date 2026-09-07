"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface RawJsonViewerProps {
  data: unknown;
  title?: string;
}

export function RawJsonViewer({ data, title = "Raw Extraction JSON" }: RawJsonViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-outline-variant/40 bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-low border-b border-outline-variant/30">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-on-surface-variant" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant" />
          )}
          <span>{title}</span>
        </button>

        {isOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2 text-[11px] gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy JSON</span>
              </>
            )}
          </Button>
        )}
      </div>

      {isOpen && (
        <pre className="p-3 text-[11px] font-mono text-on-surface-variant bg-surface-container-lowest overflow-x-auto max-h-80 leading-relaxed">
          {jsonString}
        </pre>
      )}
    </div>
  );
}
