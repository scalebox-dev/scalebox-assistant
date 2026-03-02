import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertKnowledgeDoc, InsertUser, knowledgeDocs, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Knowledge Docs =====

export async function listKnowledgeDocs() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: knowledgeDocs.id,
    fileName: knowledgeDocs.fileName,
    fileType: knowledgeDocs.fileType,
    fileSize: knowledgeDocs.fileSize,
    s3Url: knowledgeDocs.s3Url,
    s3Key: knowledgeDocs.s3Key,
    uploadedBy: knowledgeDocs.uploadedBy,
    uploadedAt: knowledgeDocs.uploadedAt,
    // Omit extractedText from list for performance
  }).from(knowledgeDocs).orderBy(desc(knowledgeDocs.uploadedAt));
}

export async function createKnowledgeDoc(data: InsertKnowledgeDoc) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(knowledgeDocs).values(data);
  return result[0].insertId;
}

export async function deleteKnowledgeDoc(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(knowledgeDocs).where(eq(knowledgeDocs.id, id));
}

export async function getKnowledgeDocById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(knowledgeDocs).where(eq(knowledgeDocs.id, id)).limit(1);
  return result[0] ?? null;
}

/** Returns concatenated extracted text from all docs (capped at 8000 chars) for LLM context */
export async function getKnowledgeContext(maxChars = 8000): Promise<string> {
  const db = await getDb();
  if (!db) return "";
  const docs = await db.select({
    fileName: knowledgeDocs.fileName,
    extractedText: knowledgeDocs.extractedText,
    uploadedAt: knowledgeDocs.uploadedAt,
  }).from(knowledgeDocs).orderBy(desc(knowledgeDocs.uploadedAt)).limit(10);

  if (docs.length === 0) return "";

  let context = "=== ScaleBox 产品知识库 ===\n";
  let remaining = maxChars;
  for (const doc of docs) {
    if (!doc.extractedText || remaining <= 0) break;
    const header = `\n--- ${doc.fileName} (${doc.uploadedAt.toLocaleDateString("zh-CN")}) ---\n`;
    const text = doc.extractedText.slice(0, remaining);
    context += header + text;
    remaining -= text.length + header.length;
  }
  return context;
}
