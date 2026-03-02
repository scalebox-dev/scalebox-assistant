/**
 * Local file storage (replaces S3/Forge).
 * Files are stored under STORAGE_DIR and served at /api/files/
 */

import fs from "fs";
import path from "path";

const STORAGE_DIR = path.resolve(process.cwd(), ".storage", "files");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/^\/+/, "").replace(/\.\./g, "");
  if (!key || key.includes("..")) {
    throw new Error("Invalid storage key");
  }
  return key;
}

function getFilePath(relKey: string): string {
  return path.join(STORAGE_DIR, normalizeKey(relKey));
}

/**
 * Save data to local disk. Returns a URL path that the server will serve at /api/files/<key>.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const filePath = getFilePath(key);
  ensureDir(path.dirname(filePath));

  const buf = typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);
  fs.writeFileSync(filePath, buf);

  const url = `/api/files/${key}`;
  return { key, url };
}

/**
 * Get a URL for reading a file (same as upload path when using local storage).
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = `/api/files/${key}`;
  return { key, url };
}

/** Absolute directory for express.static (must not serve parent paths). */
export function getStorageDir(): string {
  ensureDir(STORAGE_DIR);
  return STORAGE_DIR;
}
