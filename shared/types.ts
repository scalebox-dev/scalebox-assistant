/**
 * Unified type exports (no database schema).
 */

export * from "./_core/errors";

/** Knowledge doc row (file-based store). */
export type KnowledgeDoc = {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Url: string;
  s3Key: string;
  extractedText: string | null;
  uploadedBy: number | null;
  uploadedAt: Date;
  updatedAt: Date;
};

export type InsertKnowledgeDoc = Omit<KnowledgeDoc, "id" | "uploadedAt" | "updatedAt"> & {
  id?: number;
  uploadedAt?: Date;
  updatedAt?: Date;
};
