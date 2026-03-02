import * as ReactNative from "react-native";

/** API base URL (no auth/OAuth). */
const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
};

export const API_BASE_URL = env.apiBaseUrl;

const DEFAULT_API_BASE = "http://localhost:3000";

/**
 * Get the API base URL.
 * - 若设置了 EXPO_PUBLIC_API_BASE_URL，优先使用；
 * - Web 下可根据当前 host 推导（如 8081 -> 3000）；
 * - 本地开发（localhost/127.0.0.1）或 Native 未配置时默认 http://localhost:3000；
 * - 生产同源部署（前后端同一域名）时未配置则返回空，走相对路径。
 */
export function getApiBaseUrl(): string {
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/\/$/, "");
  }
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) {
      return `${protocol}//${apiHostname}`;
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return DEFAULT_API_BASE;
    }
    return "";
  }
  return DEFAULT_API_BASE;
}

// Kept for compatibility with lib/_core/auth.ts (no-op when auth disabled)
export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "app_user_info";
