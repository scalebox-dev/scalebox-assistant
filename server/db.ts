/**
 * File-based store for knowledge docs (replaces MySQL/Drizzle).
 * Metadata in .storage/knowledge_docs.json, files in .storage/files/knowledge/
 */

import fs from "fs";
import path from "path";
import type { KnowledgeDoc } from "../shared/types";

const DATA_DIR = path.resolve(process.cwd(), ".storage");
const META_FILE = path.join(DATA_DIR, "knowledge_docs.json");

type StoredRow = Omit<KnowledgeDoc, "uploadedAt" | "updatedAt"> & {
  uploadedAt: string;
  updatedAt: string;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readMeta(): StoredRow[] {
  ensureDataDir();
  if (!fs.existsSync(META_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(META_FILE, "utf-8");
  try {
    return JSON.parse(raw) as StoredRow[];
  } catch {
    return [];
  }
}

function writeMeta(rows: StoredRow[]) {
  ensureDataDir();
  fs.writeFileSync(META_FILE, JSON.stringify(rows, null, 2), "utf-8");
}

function toDoc(row: StoredRow): KnowledgeDoc {
  return {
    ...row,
    uploadedAt: new Date(row.uploadedAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function toStored(doc: KnowledgeDoc): StoredRow {
  return {
    ...doc,
    uploadedAt: doc.uploadedAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listKnowledgeDocs(): Promise<Omit<KnowledgeDoc, "extractedText">[]> {
  const rows = readMeta();
  return rows
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map((r) => {
      const { extractedText: _, ...rest } = toDoc(r);
      return rest;
    });
}

export async function createKnowledgeDoc(data: {
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Url: string;
  s3Key: string;
  extractedText: string | null;
  uploadedBy: number | null;
}): Promise<number> {
  const rows = readMeta();
  const id = rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1;
  const now = new Date();
  const doc: KnowledgeDoc = {
    id,
    fileName: data.fileName,
    fileType: data.fileType,
    fileSize: data.fileSize,
    s3Url: data.s3Url,
    s3Key: data.s3Key,
    extractedText: data.extractedText,
    uploadedBy: data.uploadedBy,
    uploadedAt: now,
    updatedAt: now,
  };
  rows.push(toStored(doc));
  writeMeta(rows);
  return id;
}

export async function deleteKnowledgeDoc(id: number): Promise<void> {
  const rows = readMeta();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return;
  writeMeta(next);
}

export async function getKnowledgeDocById(id: number): Promise<KnowledgeDoc | null> {
  const rows = readMeta();
  const row = rows.find((r) => r.id === id);
  return row ? toDoc(row) : null;
}

/** Returns concatenated extracted text from recent docs (capped at maxChars) for LLM context. */
export async function getKnowledgeContext(maxChars = 8000): Promise<string> {
  const rows = readMeta();
  const sorted = [...rows].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
  const recent = sorted.slice(0, 10);

  if (recent.length === 0) return "";

  let context = "=== ScaleBox 产品知识库 ===\n";
  let remaining = maxChars;
  for (const row of recent) {
    if (!row.extractedText || remaining <= 0) break;
    const header = `\n--- ${row.fileName} (${new Date(row.uploadedAt).toLocaleDateString("zh-CN")}) ---\n`;
    const text = row.extractedText.slice(0, remaining);
    context += header + text;
    remaining -= text.length + header.length;
  }
  return context;
}
