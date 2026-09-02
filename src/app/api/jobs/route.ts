import { NextRequest } from "next/server";
import { z } from "zod";
import { jobService, CreateJobSchema } from "@/features/jobs";
import { ApiError, createErrorResponse, createSuccessResponse } from "@/lib/errors/api-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const jobs = await jobService.getAllJobs({ status, search });
    return createSuccessResponse(jobs, 200, { total: jobs.length });
  } catch (error) {
    return createErrorResponse(error, "/api/jobs");
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON payload", undefined, "/api/jobs");
    }

    const validationResult = CreateJobSchema.safeParse(body);
    if (!validationResult.success) {
      const invalidParams = validationResult.error.errors.map((err: z.ZodIssue) => ({
        name: err.path.join("."),
        reason: err.message,
      }));
      throw ApiError.badRequest("Job requirement validation failed", invalidParams, "/api/jobs");
    }

    const newJob = await jobService.createJob(validationResult.data);
    return createSuccessResponse(newJob, 201);
  } catch (error) {
    return createErrorResponse(error, "/api/jobs");
  }
}
