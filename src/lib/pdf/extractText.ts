import { spawn } from "node:child_process";

export interface PdfExtractionOptions {
  layout?: boolean;
  firstPage?: number;
  lastPage?: number;
  timeoutMs?: number;
  // Controls whether link annotations are parsed and appended to extracted text
  extractLinks?: boolean;
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

// Parses a PDF string token starting at startIdx, supporting literal parentheses or hex format
function parsePdfString(str: string, startIdx: number): string | null {
  if (str[startIdx] === "(") {
    let depth = 1;
    let idx = startIdx + 1;
    let res = "";
    while (idx < str.length && depth > 0) {
      if (str[idx] === "\\") {
        idx++;
        if (idx < str.length) {
          const c = str[idx];
          if (c === "n") res += "\n";
          else if (c === "r") res += "\r";
          else if (c === "t") res += "\t";
          else if (c === "b") res += "\b";
          else if (c === "f") res += "\f";
          else res += c;
        }
      } else if (str[idx] === "(") {
        depth++;
        res += "(";
      } else if (str[idx] === ")") {
        depth--;
        if (depth > 0) res += ")";
      } else {
        res += str[idx];
      }
      idx++;
    }
    return res;
  }
  if (str[startIdx] === "<") {
    let idx = startIdx + 1;
    let hex = "";
    while (idx < str.length && str[idx] !== ">") {
      hex += str[idx];
      idx++;
    }
    hex = hex.replace(/\s+/g, "");
    if (hex.length % 2 !== 0) hex += "0";
    try {
      return Buffer.from(hex, "hex").toString("utf-8");
    } catch {
      return null;
    }
  }
  return null;
}

// Scans binary PDF buffer for link action annotation URIs (/Subtype /Link /A << ... /URI ... >>)
export function extractPdfHyperlinks(input: Buffer | Uint8Array | ArrayBuffer): string[] {
  let buffer: Buffer;
  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (input instanceof Uint8Array) {
    buffer = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  } else if (input instanceof ArrayBuffer) {
    buffer = Buffer.from(input);
  } else {
    return [];
  }

  const content = buffer.toString("latin1");
  const links = new Set<string>();
  const uriRegex = /\/URI\s*([(<])/g;
  let match: RegExpExecArray | null;

  while ((match = uriRegex.exec(content)) !== null) {
    const rawVal = parsePdfString(content, match.index + match[0].length - 1);
    if (!rawVal) continue;
    const clean = rawVal.replace(/\0/g, "").trim();
    if (/^(https?:\/\/|mailto:|tel:|wa\.me|www\.)/i.test(clean)) {
      links.add(clean);
    }
  }

  return Array.from(links);
}

// Appends detected PDF hyperlinks to the extracted text
function appendHyperlinks(text: string, links: string[]): string {
  if (links.length === 0) return text;
  return `${text}\n\n--- Document Hyperlinks ---\n${links.map((l) => `- ${l}`).join("\n")}`;
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

    const getDetectedLinks = () => {
      if (options?.extractLinks === false) return [];
      return extractPdfHyperlinks(buffer);
    };

    let proc: ReturnType<typeof spawn>;
    try {
      proc = spawn("pdftotext", args, { stdio: ["pipe", "pipe", "pipe"] });
    } catch (err) {
      try {
        const fallbackText = extractAsciiFallback(buffer);
        if (fallbackText) {
          return resolve(appendHyperlinks(fallbackText, getDetectedLinks()));
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
          return resolve(appendHyperlinks(fallback, getDetectedLinks()));
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
        resolve(appendHyperlinks(stdout.trim(), getDetectedLinks()));
      } else {
        try {
          const fallback = extractAsciiFallback(buffer);
          if (fallback.length > 50) {
            return resolve(appendHyperlinks(fallback, getDetectedLinks()));
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
