import type { LanguageModel } from "ai";

export type AiProvider = "openai" | "google" | "mock";

export interface GetModelOptions {
  provider?: AiProvider;
  model?: string | LanguageModel;
}


