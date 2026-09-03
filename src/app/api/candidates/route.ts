import { NextRequest } from "next/server";
import { candidatesService } from "@/features/candidates";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;
    const search = searchParams.get("search") || undefined;

    const candidates = await candidatesService.getAllCandidates({ jobId, search });
    return createSuccessResponse(candidates, 200, { total: candidates.length });
  } catch (error) {
    return createErrorResponse(error, "/api/candidates");
  }
}
