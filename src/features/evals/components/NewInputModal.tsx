"use client";

import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SharedEvalInput } from "../storage/evalStore";

export interface NewInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: { name: string; resumeText: string; description?: string }) => Promise<void>;
  initialInput?: SharedEvalInput | null;
}

export function NewInputModal({
  isOpen,
  onClose,
  onSave,
  initialInput,
}: NewInputModalProps) {
  const [name, setName] = useState(initialInput?.name || "");
  const [description, setDescription] = useState(initialInput?.description || "");
  const [resumeText, setResumeText] = useState(initialInput?.resumeText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter an identification name for this input.");
      return;
    }
    if (!resumeText.trim()) {
      setErrorMsg("Please enter or paste the candidate resume text.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        resumeText: resumeText.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Failed to save input: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div>
            <h2 className="text-base font-bold text-on-surface">
              {initialInput ? "Edit Shared Test Input" : "Add Named Test Input"}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Saved permanently to collection and available across all stress-testing tabs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface block">
              Identification Name *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali Khan - Lead Full-Stack Engineer"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface block">
              Description / Context (Optional)
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Overlapping contract roles with FAST-NUCES degree"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface block">
              Candidate Resume Text *
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste raw candidate CV/resume text here..."
              rows={10}
              className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3 text-xs font-mono text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/40 leading-relaxed resize-y"
              required
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 px-3 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="h-8 px-4 text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Saving to Disk..." : "Save to Collection"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
