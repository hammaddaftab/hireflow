import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { AiProvider, GetModelOptions } from "./types";
import { ApiError } from "@/lib/errors/api-error";

export { openai, google };

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_GOOGLE_MODEL = "gemini-2.0-flash";

/**
 * Returns a MockLanguageModel for tests and offline environments.
 */
export function getMockModel(modelId = "mock-model"): LanguageModel {
  return new MockLanguageModelV4({
    provider: "mock",
    modelId,
    doGenerate: async () => ({
      content: [{ type: "text", text: '{"status":"ok","message":"Mock response generated successfully"}' }],
      finishReason: { unified: "stop", raw: "stop" },
      usage: {
        inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
        outputTokens: { total: 20, text: 20, reasoning: 0 },
      },
      warnings: [],
    }),
  }) as unknown as LanguageModel;
}

/**
 * Resolves a LanguageModel instance based on provider and model name.
 */
export function getLanguageModel(options?: GetModelOptions): LanguageModel {
  if (options?.model && typeof options.model === "object" && "specificationVersion" in options.model) {
    return options.model;
  }

  const provider: AiProvider =
    options?.provider || (process.env.AI_DEFAULT_PROVIDER as AiProvider) || "openai";

  if (provider === "mock") {
    const modelId = typeof options?.model === "string" ? options.model : "mock-model";
    return getMockModel(modelId);
  }

  if (provider === "openai") {
    const modelName =
      (typeof options?.model === "string" ? options.model : undefined) ||
      process.env.AI_DEFAULT_OPENAI_MODEL ||
      DEFAULT_OPENAI_MODEL;
    return openai(modelName) as unknown as LanguageModel;
  }

  if (provider === "google") {
    const modelName =
      (typeof options?.model === "string" ? options.model : undefined) ||
      process.env.AI_DEFAULT_GOOGLE_MODEL ||
      DEFAULT_GOOGLE_MODEL;
    return google(modelName) as unknown as LanguageModel;
  }

  throw new ApiError({
    status: 400,
    title: "Unsupported AI Provider",
    detail: `Provider '${provider}' is not supported. Supported providers are 'openai', 'google', 'mock'.`,
    type: "urn:hireflow:error:ai:unsupported-provider",
  });
}
