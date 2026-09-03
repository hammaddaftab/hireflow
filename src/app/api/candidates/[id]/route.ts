import { NextRequest } from "next/server";
import { candidatesService } from "@/features/candidates";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = await candidatesService.getCandidateById(id);

    if (!candidate) {
      throw ApiError.notFound(`Candidate with ID '${id}' not found`, `/api/candidates/${id}`);
    }

    return createSuccessResponse(candidate, 200);
  } catch (error) {
    return createErrorResponse(error);
  }
}
