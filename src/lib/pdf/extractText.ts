import { spawn } from "node:child_process";

export interface PdfExtractionOptions {
  layout?: boolean;
  firstPage?: number;
  lastPage?: number;
  timeoutMs?: number;
}

/**
 * Checks if the buffer contains a PDF header signature (%PDF-).
 */
export function isPdfBuffer(input: Buffer | Uint8Array | ArrayBuffer): boolean {
  let buf: Buffer;
  if (Buffer.isBuffer(input)) {
    buf = input;
  } else if (input instanceof Uint8Array) {
    buf = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  } else if (input instanceof ArrayBuffer) {
    buf = Buffer.from(input);
  } else {
    return false;
  }

  if (buf.length < 5) return false;
  const header = buf.subarray(0, Math.min(buf.length, 1024)).toString("latin1");
  return header.includes("%PDF-");
}

/**
 * Fallback heuristic to extract readable text chunks from a PDF buffer
 * if pdftotext is unavailable or encounters an unrecoverable process error.
 */
function extractAsciiFallback(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const matches: string[] = [];
  const textPattern = /\(([^()]{2,})\)\s*(?:Tj|'|")/g;
  let match: RegExpExecArray | null;
  while ((match = textPattern.exec(content)) !== null) {
    const raw = match[1].replace(/\\([()\\])/g, "$1").trim();
    if (raw.length > 1 && !/^[^\w\s]+$/.test(raw)) {
      matches.push(raw);
    }
  }

  if (matches.length > 5) {
    return matches.join(" ");
  }

  const chunks = content.match(/[\x20-\x7E\t\n\r]{4,}/g) || [];
  return chunks
    .filter((c) => !c.startsWith("/Length") && !c.startsWith("<<") && !c.includes("endobj"))
    .join("\n")
    .trim();
}

/**
 * Modular PDF text extractor that feeds a binary buffer into pdftotext (poppler) via stdin/stdout.
 * Decoupled from HTTP / Next.js request objects for reuse with Gmail attachments, uploads, and local files.
 */
export async function extractTextFromPdf(
  input: Buffer | Uint8Array | ArrayBuffer,
  options?: PdfExtractionOptions
): Promise<string> {
  let buffer: Buffer;
  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (input instanceof Uint8Array) {
    buffer = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  } else if (input instanceof ArrayBuffer) {
    buffer = Buffer.from(input);
  } else {
    throw new Error("Invalid PDF input: expected Buffer, Uint8Array, or ArrayBuffer");
  }

  if (buffer.length === 0) {
    throw new Error("Cannot extract text from empty buffer");
  }

  const timeoutMs = options?.timeoutMs ?? 15000;

  return new Promise<string>((resolve, reject) => {
    const args: string[] = ["-enc", "UTF-8"];
    if (options?.layout) {
      args.push("-layout");
    }
    if (options?.firstPage && options.firstPage > 0) {
      args.push("-f", options.firstPage.toString());
    }
    if (options?.lastPage && options.lastPage > 0) {
      args.push("-l", options.lastPage.toString());
    }
    args.push("-", "-");

    let proc: ReturnType<typeof spawn>;
    try {
      proc = spawn("pdftotext", args, { stdio: ["pipe", "pipe", "pipe"] });
    } catch (err) {
      try {
        const fallbackText = extractAsciiFallback(buffer);
        if (fallbackText) {
          return resolve(fallbackText);
        }
      } catch {
        // ignore fallback error
      }
      return reject(new Error(`Failed to spawn pdftotext: ${err instanceof Error ? err.message : String(err)}`));
    }

    let stdout = "";
    let stderr = "";
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try {
          proc.kill("SIGKILL");
        } catch {
          // ignore
        }
        reject(new Error(`pdftotext execution timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    proc.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf-8");
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf-8");
    });

    proc.stdin?.on("error", (err: Error) => {
      if ((err as NodeJS.ErrnoException).code !== "EPIPE") {
        stderr += `\nstdin error: ${err.message}`;
      }
    });

    proc.on("error", (err: Error) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);

      try {
        const fallback = extractAsciiFallback(buffer);
        if (fallback.length > 50) {
          return resolve(fallback);
        }
      } catch {
        // ignore fallback error
      }

      reject(new Error(`pdftotext process error: ${err.message}`));
    });

    proc.on("close", (code: number | null) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);

      if (code === 0) {
        resolve(stdout.trim());
      } else {
        try {
          const fallback = extractAsciiFallback(buffer);
          if (fallback.length > 50) {
            return resolve(fallback);
          }
        } catch {
          // ignore
        }
        reject(new Error(`pdftotext exited with code ${code}: ${stderr.trim() || "Unknown error"}`));
      }
    });

    try {
      if (!proc.stdin) {
        throw new Error("Failed to open stdin stream for pdftotext process");
      }
      proc.stdin.end(buffer);
    } catch (err) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        reject(err);
      }
    }
  });
}
