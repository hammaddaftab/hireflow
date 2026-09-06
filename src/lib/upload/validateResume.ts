// Pure validation rules for candidate resume file ingestion

export const MAX_RESUME_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".txt", ".docx", ".doc", ".md"] as const;

// Check if a file has an allowed resume extension
export function isValidResumeExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_RESUME_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

// Validate file constraints before persistence
export function validateResumeFile(file: { name: string; size: number }): { valid: boolean; error?: string } {
  if (!file.name || !file.name.trim()) {
    return { valid: false, error: "File name is required" };
  }

  if (file.size <= 0) {
    return { valid: false, error: "File is empty (0 bytes)" };
  }

  if (file.size > MAX_RESUME_SIZE_BYTES) {
    const sizeMb = Math.round(file.size / (1024 * 1024));
    return {
      valid: false,
      error: `File '${file.name}' exceeds the maximum allowed size of 25 MB (${sizeMb} MB detected)`,
    };
  }

  if (!isValidResumeExtension(file.name)) {
    return {
      valid: false,
      error: `Unsupported file format for '${file.name}'. Allowed formats: PDF, DOCX, TXT, MD`,
    };
  }

  return { valid: true };
}
