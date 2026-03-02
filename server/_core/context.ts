import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

const HEADER_LLM_KEY = "x-llm-api-key";
const HEADER_LLM_URL = "x-llm-api-url";
const HEADER_LLM_PROVIDER = "x-llm-provider";

function getHeader(req: CreateExpressContextOptions["req"], name: string): string | undefined {
  const v = req.headers[name];
  if (typeof v === "string") return v.trim() || undefined;
  if (Array.isArray(v) && v[0]) return String(v[0]).trim() || undefined;
  return undefined;
}

export type LlmProvider = "openai" | "google" | "vertex";

/** No auth. llmApiKey/llmApiUrl/provider from request headers (per-browser, set in Settings). */
export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: null;
  llmApiKey: string | undefined;
  llmApiUrl: string | undefined;
  /** "openai" = OpenAI 兼容; "google" = Google Gemini / Vertex */
  llmProvider: LlmProvider;
};

function parseProvider(v: string | undefined): LlmProvider {
  const s = (v ?? "").toLowerCase();
  if (s === "vertex") return "vertex";
  if (s === "google") return "google";
  return "openai";
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    user: null,
    llmApiKey: getHeader(opts.req, HEADER_LLM_KEY),
    llmApiUrl: getHeader(opts.req, HEADER_LLM_URL),
    llmProvider: parseProvider(getHeader(opts.req, HEADER_LLM_PROVIDER)),
  };
}
