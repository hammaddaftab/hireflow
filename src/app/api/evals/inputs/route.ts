export const dynamic = "force-dynamic";


import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";
import {
  getInputs,
  saveInput,
  deleteInput,
  getAllLatestRuns,
} from "@/features/evals/storage/evalStore";

const SaveInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required for identification"),
  description: z.string().optional(),
  resumeText: z.string().min(5, "Resume text must be at least 5 characters"),
  category: z.string().optional(),
  expected: z.any().optional(),
});

// GET /api/evals/inputs
// Returns all shared inputs and their latest run results
export async function GET() {
  try {
    const inputs = await getInputs();
    const latestRuns = await getAllLatestRuns();

    return createSuccessResponse({
      inputs,
      latestRuns,
      count: inputs.length,
    });
  } catch (error) {
    return createErrorResponse(error, "/api/evals/inputs");
  }
}

// POST /api/evals/inputs
// Creates or updates a named shared input
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON request body", undefined, "/api/evals/inputs");
    }

    const parseResult = SaveInputSchema.safeParse(body);
    if (!parseResult.success) {
      throw ApiError.badRequest(
        "Invalid input payload",
        parseResult.error.errors.map((e) => ({
          name: e.path.join("."),
          reason: e.message,
        })),
        "/api/evals/inputs"
      );
    }

    const saved = await saveInput(parseResult.data);
    return createSuccessResponse(saved);
  } catch (error) {
    return createErrorResponse(error, "/api/evals/inputs");
  }
}

// DELETE /api/evals/inputs?id=...
// Deletes a named shared input
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw ApiError.badRequest("Input ID query parameter is required", undefined, "/api/evals/inputs");
    }

    const success = await deleteInput(id);
    if (!success) {
      throw ApiError.notFound(`Input '${id}' not found`, "/api/evals/inputs");
    }

    return createSuccessResponse({ deleted: true, id });
  } catch (error) {
    return createErrorResponse(error, "/api/evals/inputs");
  }
}
