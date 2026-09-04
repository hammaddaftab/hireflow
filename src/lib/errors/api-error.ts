import { NextResponse } from "next/server";
import type { ApiEnvelope } from "@/types";

export interface InvalidParam {
  name: string;
  reason: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly type: string;
  public readonly title: string;
  public readonly detail: string;
  public readonly instance?: string;
  public readonly invalidParams?: InvalidParam[];

  constructor(options: {
    status: number;
    title: string;
    detail: string;
    type?: string;
    instance?: string;
    invalidParams?: InvalidParam[];
  }) {
    super(options.detail);
    this.name = "ApiError";
    this.status = options.status;
    this.title = options.title;
    this.detail = options.detail;
    this.type = options.type || `urn:hireflow:error:${options.status}`;
    this.instance = options.instance;
    this.invalidParams = options.invalidParams;
  }

  static badRequest(detail: string, invalidParams?: InvalidParam[], instance?: string): ApiError {
    return new ApiError({
      status: 400,
      title: "Bad Request",
      detail,
      type: "urn:hireflow:error:bad-request",
      invalidParams,
      instance,
    });
  }

  static notFound(detail = "Resource not found", instance?: string): ApiError {
    return new ApiError({
      status: 404,
      title: "Not Found",
      detail,
      type: "urn:hireflow:error:not-found",
      instance,
    });
  }

  static internal(detail = "An unexpected error occurred", instance?: string): ApiError {
    return new ApiError({
      status: 500,
      title: "Internal Server Error",
      detail,
      type: "urn:hireflow:error:internal",
      instance,
    });
  }
}

export function createErrorResponse(error: unknown, instance?: string): NextResponse<ApiEnvelope<never>> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: error.type,
          title: error.title,
          status: error.status,
          detail: error.detail,
          instance: error.instance || instance,
          invalidParams: error.invalidParams,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: error.status }
    );
  }

  const detail = error instanceof Error ? error.message : "An unexpected error occurred";
  return NextResponse.json(
    {
      success: false,
      error: {
        type: "urn:hireflow:error:500",
        title: "Internal Server Error",
        status: 500,
        detail,
        instance,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(data: T, status = 200, metadataExtra?: Record<string, unknown>): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadataExtra,
      },
    },
    { status }
  );
}
