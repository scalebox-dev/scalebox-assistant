/**
 * LLM API Key/URL stored only on this device (localStorage / SecureStore).
 * Sent per-request via header; only this browser/device can use the key.
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY_STORAGE = "llm_api_key";
const URL_STORAGE = "llm_api_url";
const PROVIDER_STORAGE = "llm_provider";

export type LlmProvider = "openai" | "google" | "vertex";

export async function getStoredLlmKey(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return typeof window !== "undefined" ? window.localStorage.getItem(KEY_STORAGE) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY_STORAGE);
}

export async function getStoredLlmUrl(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return typeof window !== "undefined" ? window.localStorage.getItem(URL_STORAGE) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(URL_STORAGE);
}

export async function setStoredLlmKey(value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      if (value) window.localStorage.setItem(KEY_STORAGE, value);
      else window.localStorage.removeItem(KEY_STORAGE);
    }
    return;
  }
  if (value) await SecureStore.setItemAsync(KEY_STORAGE, value);
  else await SecureStore.deleteItemAsync(KEY_STORAGE);
}

export async function setStoredLlmUrl(value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      if (value) window.localStorage.setItem(URL_STORAGE, value);
      else window.localStorage.removeItem(URL_STORAGE);
    }
    return;
  }
  if (value) await SecureStore.setItemAsync(URL_STORAGE, value);
  else await SecureStore.deleteItemAsync(URL_STORAGE);
}

export async function getStoredLlmProvider(): Promise<LlmProvider> {
  let raw: string | null = null;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    raw = window.localStorage.getItem(PROVIDER_STORAGE);
  } else {
    raw = await SecureStore.getItemAsync(PROVIDER_STORAGE);
  }
  const v = (raw ?? "").toLowerCase();
  if (v === "google") return "google";
  if (v === "vertex") return "vertex";
  return "openai";
}

export async function setStoredLlmProvider(value: LlmProvider): Promise<void> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(PROVIDER_STORAGE, value);
    return;
  }
  await SecureStore.setItemAsync(PROVIDER_STORAGE, value);
}

export async function getStoredLlmConfig(): Promise<{
  llmApiUrl: string;
  hasKey: boolean;
  provider: LlmProvider;
}> {
  const [url, key, provider] = await Promise.all([
    getStoredLlmUrl(),
    getStoredLlmKey(),
    getStoredLlmProvider(),
  ]);
  return {
    llmApiUrl: url ?? "",
    hasKey: Boolean(key && key.trim()),
    provider,
  };
}
