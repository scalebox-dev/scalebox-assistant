import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import {
  getStoredLlmKey,
  getStoredLlmProvider,
  getStoredLlmUrl,
} from "@/lib/_core/llm-config";

/**
 * tRPC React client for type-safe API calls.
 *
 * IMPORTANT (tRPC v11): The `transformer` must be inside `httpBatchLink`,
 * NOT at the root createClient level. This ensures client and server
 * use the same serialization format (superjson).
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Creates the tRPC client with proper configuration.
 * Call this once in your app's root layout.
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        // tRPC v11: transformer MUST be inside httpBatchLink, not at root
        transformer: superjson,
        async headers() {
          const [key, url, provider] = await Promise.all([
            getStoredLlmKey(),
            getStoredLlmUrl(),
            getStoredLlmProvider(),
          ]);
          const h: Record<string, string> = {};
          if (key?.trim()) h["X-LLM-API-Key"] = key.trim();
          if (url?.trim()) h["X-LLM-API-URL"] = url.trim();
          h["X-LLM-Provider"] = provider;
          return h;
        },
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
      }),
    ],
  });
}
