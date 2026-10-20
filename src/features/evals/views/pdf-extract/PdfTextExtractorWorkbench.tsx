"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Download,
  AlertCircle,
  Clock,
  ArrowRight,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NewInputModal } from "../../components/NewInputModal";

interface ExtractedData {
  text: string;
  filename: string;
  fileSizeBytes: number;
  durationMs: number;
  characterCount: number;
  wordCount: number;
  lineCount: number;
  linksCount?: number;
}

// Minimal workbench for uploading PDFs and viewing extracted raw text
export function PdfTextExtractorWorkbench() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Saves extracted PDF text into the shared test collection
  const handleSaveToCollection = async (inp: { name: string; resumeText: string; description?: string }) => {
    const res = await fetch("/api/evals/inputs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inp),
    });
    if (!res.ok) throw new Error("Failed to save to collection");
    setSaveSuccessMsg(`Saved "${inp.name}" to shared test collection!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Uploads a PDF file directly to the extraction endpoint
  const handleUploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a PDF file (.pdf)");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/evals/pdf-extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to extract text from PDF");
      }

      setExtractedData(data.data as ExtractedData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`PDF extraction failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Loads bundled mock PDF samples for quick testing
  const handleLoadSample = async (sampleName: "mock_resume_a.pdf" | "mock_resume_b.pdf") => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/evals/pdf-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample: sampleName }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error?.message || "Failed to extract sample PDF");
      }

      setExtractedData(data.data as ExtractedData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Sample extraction failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Copies extracted text to clipboard
  const handleCopyText = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(extractedData.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Downloads extracted text as a plain text file
  const handleDownloadText = () => {
    if (!extractedData) return;
    const blob = new Blob([extractedData.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${extractedData.filename.replace(/\.pdf$/i, "")}_extracted.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Error Callout */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setErrorMsg(null)}
            className="h-6 px-2 text-xs"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Upload Zone & Quick Actions */}
      <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
          <div>
            <h2 className="text-base font-bold text-on-surface">PDF Text Extraction</h2>
            <p className="text-xs text-on-surface-variant">
              Upload any PDF resume or document to extract raw textual content using the poppler engine with zero database side-effects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-on-surface-variant">Quick Samples:</span>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleLoadSample("mock_resume_a.pdf")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              Resume A (Jillani)
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleLoadSample("mock_resume_b.pdf")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              Resume B (Abdullah)
            </Button>
          </div>
        </div>

        {/* Dropzone container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-xl border-2 border-dashed transition-colors text-center cursor-pointer space-y-2 ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container-low hover:border-primary/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleUploadFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="inline-flex p-3 rounded-full bg-surface text-primary shadow-xs">
            <Upload className="h-5 w-5" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-on-surface">
              Click to select a PDF or drag and drop here
            </p>
            <p className="text-[11px] text-on-surface-variant">
              Supports standard and multi-page PDF documents (.pdf)
            </p>
          </div>

          {isLoading && (
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-primary font-medium">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Extracting text via pdftotext...</span>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Text Display */}
      {extractedData && (
        <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs space-y-4">
          {/* Metadata & Actions Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
            {/* Metadata Stats */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate max-w-xs">{extractedData.filename}</span>
              </div>
              <span className="text-on-surface-variant/40">•</span>
              <span className="font-mono">{formatFileSize(extractedData.fileSizeBytes)}</span>
              <span className="text-on-surface-variant/40">•</span>
              <div className="flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>{extractedData.durationMs}ms</span>
              </div>
              <span className="text-on-surface-variant/40">•</span>
              <span className="font-mono font-semibold text-on-surface">
                {extractedData.characterCount.toLocaleString()} chars
              </span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="font-mono">{extractedData.wordCount.toLocaleString()} words</span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="font-mono">{extractedData.lineCount.toLocaleString()} lines</span>
              {extractedData.linksCount !== undefined && (
                <>
                  <span className="text-on-surface-variant/40">•</span>
                  <span className="font-mono text-primary font-medium">{extractedData.linksCount} links</span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                className="h-8 px-3 text-xs font-semibold gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveModalOpen(true)}
                className="h-8 px-3 text-xs font-semibold gap-1.5"
              >
                <BookmarkPlus className="h-3.5 w-3.5 text-primary" />
                <span>Save to Collection</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadText}
                className="h-8 px-3 text-xs font-semibold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .txt</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExtractedData(null)}
                className="h-8 px-2.5 text-xs text-on-surface-variant hover:text-on-surface"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                <span>Clear</span>
              </Button>

              <Link href="/evals/experience">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-semibold gap-1.5"
                >
                  <span>Work Experience</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>

              <Link href="/evals/education">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <span>Education Tab</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Success Callout */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
              {saveSuccessMsg}
            </div>
          )}

          {/* Raw Text Output Container */}
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-on-surface whitespace-pre-wrap leading-relaxed select-all">
              {extractedData.text || "(No readable text layer was found in this PDF document)"}
            </pre>
          </div>

          {/* Modal to save to collection */}
          <NewInputModal
            isOpen={saveModalOpen}
            onClose={() => setSaveModalOpen(false)}
            onSave={handleSaveToCollection}
            initialInput={{
              id: "",
              name: extractedData.filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
              description: `Extracted from PDF (${extractedData.filename}, ${extractedData.lineCount} lines)`,
              resumeText: extractedData.text,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
          />
        </div>
      )}
    </div>
  );
}
