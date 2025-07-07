import OpenAI from "openai";

// AI Provider Configuration
export type AIProvider = "openai" | "deepseek";

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseURL?: string;
  model: string;
}

export function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER || "openai") as AIProvider;
  
  switch (provider) {
    case "deepseek":
      return {
        provider: "deepseek",
        apiKey: process.env.DEEPSEEK_API_KEY || "",
        baseURL: "https://api.deepseek.com/v1",
        model: "deepseek-chat"
      };
    case "openai":
    default:
      return {
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "gpt-4o"
      };
  }
}

export function createAIClient(): OpenAI {
  const config = getAIConfig();
  
  if (config.provider === "deepseek") {
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
  }
  
  return new OpenAI({
    apiKey: config.apiKey
  });
}

export function getAIModel(): string {
  return getAIConfig().model;
}

export function getProviderName(): string {
  const provider = getAIConfig().provider;
  return provider === "deepseek" ? "DeepSeek" : "OpenAI";
}