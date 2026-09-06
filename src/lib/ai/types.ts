import type { LanguageModel } from "ai";

export type AiProvider = "openai" | "google" | "mock";
// Valid runtime options for LLM_PROVIDER
export const VALID_AI_PROVIDERS = ["openai", "google", "mock"] as const;

export interface GetModelOptions {
  provider?: AiProvider;
  model?: string | LanguageModel;
}


