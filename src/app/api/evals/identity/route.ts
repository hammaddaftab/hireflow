export const dynamic = "force-dynamic";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;


import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";
import { parseAndNormalizeIdentity } from "@/features/evals/services/identityParseService";
import { saveRun } from "@/features/evals/storage/evalStore";

const IdentityParsePayloadSchema = z.object({
  resumeText: z.string().min(5, "Resume text must be at least 5 characters"),
  inputId: z.string().optional(),
});

// POST /api/evals/identity
// Extracts candidate identity aspects (name, contact, location, portfolio links) and traces normalization
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON request body", undefined, "/api/evals/identity");
    }

    const parseResult = IdentityParsePayloadSchema.safeParse(body);
    if (!parseResult.success) {
      throw ApiError.badRequest(
        "Invalid identity parse payload",
        parseResult.error.errors.map((e) => ({
          name: e.path.join("."),
          reason: e.message,
        })),
        "/api/evals/identity"
      );
    }

    const { resumeText, inputId } = parseResult.data;
    const result = await parseAndNormalizeIdentity(resumeText);

    // Persist run output permanently if bound to an inputId
    if (inputId) {
      try {
        await saveRun({
          inputId,
          aspect: "identity",
          status: result.diagnostics.some((d) => d.level === "error") ? "fail" : "completed",
          durationMs: result.durationMs,
          model: result.model,
          provider: "openai",
          summary: result.summary,
          diagnostics: result.diagnostics,
          data: result,
        });
      } catch {
        // Ignore persistence error
      }
    }

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "/api/evals/identity");
  }
}
