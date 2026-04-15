import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Tier 1: Local LM Studio
  local: {
    baseUrl: process.env.LOCAL_BASE_URL || 'http://127.0.0.1:1234/v1',
    model: process.env.LOCAL_MODEL || 'local-model',
  },
  // Tier 2: OpenRouter
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku', // Defaulting to a fast, cost-effective model, but can be overridden
  },
  // Tier 3: Gemini
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  }
};
