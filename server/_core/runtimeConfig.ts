/**
 * Runtime config stored in .storage/config.json (overrides env for LLM etc.)
 */

import fs from "fs";
import path from "path";
import { ENV } from "./env";

const CONFIG_DIR = path.resolve(process.cwd(), ".storage");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export type LlmConfig = {
  llmApiUrl: string;
  llmApiKey: string;
};

function ensureDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function readRaw(): Record<string, unknown> {
  ensureDir();
  if (!fs.existsSync(CONFIG_FILE)) return {};
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writeRaw(data: Record<string, unknown>) {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** LLM API URL and Key: file config first, then env. */
export function getLlmConfig(): LlmConfig {
  const raw = readRaw();
  const url = (raw.llmApiUrl as string) ?? ENV.llmApiUrl ?? "";
  const key = (raw.llmApiKey as string) ?? ENV.llmApiKey ?? "";
  return { llmApiUrl: typeof url === "string" ? url : "", llmApiKey: typeof key === "string" ? key : "" };
}

export function setLlmConfig(updates: { llmApiUrl?: string; llmApiKey?: string }) {
  const raw = readRaw();
  if (updates.llmApiUrl !== undefined) raw.llmApiUrl = updates.llmApiUrl;
  if (updates.llmApiKey !== undefined) raw.llmApiKey = updates.llmApiKey;
  writeRaw(raw);
}
