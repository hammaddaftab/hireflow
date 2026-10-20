export const dynamic = "force-dynamic";

// Vercel serverless function max duration in seconds (Hobby plan limit)
export const maxDuration = 60;


import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";
import { parseAndNormalizeEducation } from "@/features/evals/services/educationParseService";
import { saveRun } from "@/features/evals/storage/evalStore";

const EducationParsePayloadSchema = z.object({
  resumeText: z.string().min(5, "Resume text must be at least 5 characters"),
  inputId: z.string().optional(),
});

// POST /api/evals/education
// Extracts education section and traces normalization pipeline
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON request body", undefined, "/api/evals/education");
    }

    const parseResult = EducationParsePayloadSchema.safeParse(body);
    if (!parseResult.success) {
      throw ApiError.badRequest(
        "Invalid education parse payload",
        parseResult.error.errors.map((e) => ({
          name: e.path.join("."),
          reason: e.message,
        })),
        "/api/evals/education"
      );
    }

    const { resumeText, inputId } = parseResult.data;
    const result = await parseAndNormalizeEducation(resumeText);

    // Persist run output permanently if bound to an inputId
    if (inputId) {
      try {
        await saveRun({
          inputId,
          aspect: "education",
          status: "completed",
          durationMs: result.durationMs,
          model: result.model,
          provider: "openai",
          summary: {
            rawEntriesCount: result.rawEntriesCount,
            normalizedEntriesCount: result.normalizedEntriesCount,
            highestDegreeTier: result.highestDegreeTier,
          },
          data: result,
        });
      } catch {
        // Ignore persistence error
      }
    }

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error, "/api/evals/education");
  }
}
