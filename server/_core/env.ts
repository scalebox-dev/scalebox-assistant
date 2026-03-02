/**
 * Server environment variables.
 * No Manus/Forge: use generic API URL/KEY for LLM, optional for voice/image.
 */
export const ENV = {
  isProduction: process.env.NODE_ENV === "production",
  llmApiUrl: process.env.LLM_API_URL ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  voiceApiUrl: process.env.VOICE_API_URL ?? "",
  voiceApiKey: process.env.VOICE_API_KEY ?? "",
  imageApiUrl: process.env.IMAGE_API_URL ?? "",
  imageApiKey: process.env.IMAGE_API_KEY ?? "",
  dataApiUrl: process.env.DATA_API_URL ?? "",
  dataApiKey: process.env.DATA_API_KEY ?? "",
};
