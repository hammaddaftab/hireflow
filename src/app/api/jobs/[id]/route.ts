import { NextRequest } from "next/server";
import { z } from "zod";
import { jobService, UpdateJobSchema } from "@/features/jobs";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await jobService.getJobById(id);

    if (!job) {
      throw ApiError.notFound(`Job with ID '${id}' not found`, `/api/jobs/${id}`);
    }

    return createSuccessResponse(job, 200);
  } catch (error) {
    return createErrorResponse(error, `/api/jobs`);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON payload", undefined, `/api/jobs/${id}`);
    }

    const validationResult = UpdateJobSchema.safeParse(body);
    if (!validationResult.success) {
      const invalidParams = validationResult.error.errors.map((err: z.ZodIssue) => ({
        name: err.path.join("."),
        reason: err.message,
      }));
      throw ApiError.badRequest("Job update validation failed", invalidParams, `/api/jobs/${id}`);
    }

    const updatedJob = await jobService.updateJob(id, validationResult.data);
    if (!updatedJob) {
      throw ApiError.notFound(`Job with ID '${id}' not found for update`, `/api/jobs/${id}`);
    }

    return createSuccessResponse(updatedJob, 200);
  } catch (error) {
    return createErrorResponse(error, `/api/jobs`);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await jobService.deleteJob(id);

    if (!deleted) {
      throw ApiError.notFound(`Job with ID '${id}' not found for deletion`, `/api/jobs/${id}`);
    }

    return createSuccessResponse({ id, deleted: true }, 200);
  } catch (error) {
    return createErrorResponse(error, `/api/jobs`);
  }
}
