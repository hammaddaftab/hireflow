import { ApiError } from "@/lib/errors/api-error";

/**
 * Normalizes caught AI SDK errors into HireFlow's standard ApiError structure.
 */
export function toAiApiError(error: unknown, context = "/api/ai"): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    const name = typeof err.name === "string" ? err.name : "AiError";
    const rawMessage = typeof err.message === "string" ? err.message : "An unexpected AI operation error occurred";
    const statusCode =
      typeof err.statusCode === "number"
        ? err.statusCode
        : typeof err.status === "number"
        ? err.status
        : undefined;

    // Missing or invalid API key
    if (name === "LoadAPIKeyError" || rawMessage.toLowerCase().includes("api key") || statusCode === 401) {
      return new ApiError({
        status: 401,
        title: "AI Authentication Failed",
        detail: rawMessage || "Missing or invalid AI provider API key. Check environment variables.",
        type: "urn:hireflow:error:ai:unauthorized",
        instance: context,
      });
    }

    // Rate limit exceeded
    if (statusCode === 429 || rawMessage.toLowerCase().includes("rate limit") || rawMessage.toLowerCase().includes("quota")) {
      return new ApiError({
        status: 429,
        title: "AI Rate Limit Exceeded",
        detail: "The AI provider rate limit or quota has been reached. Please retry shortly.",
        type: "urn:hireflow:error:ai:rate-limited",
        instance: context,
      });
    }

    // Schema validation or JSON parsing error
    if (name === "TypeValidationError" || name === "JSONParseError" || name === "NoObjectGeneratedError") {
      return new ApiError({
        status: 422,
        title: "AI Output Validation Failed",
        detail: rawMessage || "The AI response failed to match the expected schema.",
        type: "urn:hireflow:error:ai:schema-validation-failed",
        instance: context,
      });
    }

    // Model not found
    if (name === "NoSuchModelError" || statusCode === 404) {
      return new ApiError({
        status: 404,
        title: "AI Model Not Found",
        detail: rawMessage || "The requested AI model is not supported or does not exist.",
        type: "urn:hireflow:error:ai:model-not-found",
        instance: context,
      });
    }

    // Timeout or abort
    if (name === "AbortError" || name === "TimeoutError" || statusCode === 408 || statusCode === 504) {
      return new ApiError({
        status: 504,
        title: "AI Request Timeout",
        detail: "The AI request exceeded the timeout threshold.",
        type: "urn:hireflow:error:ai:timeout",
        instance: context,
      });
    }

    // Upstream provider unavailable
    if (statusCode === 502 || statusCode === 503) {
      return new ApiError({
        status: 503,
        title: "AI Provider Unavailable",
        detail: "The upstream AI provider is temporarily unavailable. Please try again later.",
        type: "urn:hireflow:error:ai:provider-unavailable",
        instance: context,
      });
    }

    return new ApiError({
      status: 500,
      title: "AI Execution Error",
      detail: rawMessage,
      type: "urn:hireflow:error:ai:execution-failed",
      instance: context,
    });
  }

  return new ApiError({
    status: 500,
    title: "AI Internal Error",
    detail: typeof error === "string" ? error : "An unexpected AI error occurred",
    type: "urn:hireflow:error:ai:internal",
    instance: context,
  });
}
