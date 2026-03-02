import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import * as db from "./db";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Extract plain text from base64-encoded file content (TXT / MD only). */
function extractTextFromBase64(base64: string, fileType: string): string {
  try {
    const buf = Buffer.from(base64, "base64");
    const raw = buf.toString("utf-8");
    if (fileType === "txt" || fileType === "md") return raw.slice(0, 50000);
    // For PDF/DOCX we return a placeholder; real extraction would require pdf-parse / mammoth
    // which are not pre-installed. We store the raw bytes and note the limitation.
    return `[${fileType.toUpperCase()} 文件已上传，文本提取需要服务端解析库支持。文件大小: ${buf.length} bytes]`;
  } catch {
    return "";
  }
}

/** Generate a random 8-char suffix to avoid key collisions. */
function randomSuffix() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── router ─────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  // ── AI generation (knowledge-aware) ───────────────────────────────────────
  ai: router({
    generate: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
            }),
          ),
          useKnowledge: z.boolean().optional().default(true),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        console.log("[ai.generate] request", {
          provider: ctx.llmProvider,
          hasKey: Boolean(ctx.llmApiKey),
          hasUrl: Boolean(ctx.llmApiUrl),
          useKnowledge: input.useKnowledge,
          messageCount: input.messages.length,
        });

        try {
          let messages = [...input.messages];

          // Inject knowledge base context into system prompt if available
          if (input.useKnowledge) {
            const knowledgeCtx = await db.getKnowledgeContext(8000);
            if (knowledgeCtx) {
              const systemIdx = messages.findIndex((m) => m.role === "system");
              const knowledgeBlock = `\n\n${knowledgeCtx}\n\n请优先参考以上知识库内容来回答，确保内容与最新产品信息一致。`;
              if (systemIdx >= 0) {
                messages[systemIdx] = {
                  ...messages[systemIdx],
                  content: messages[systemIdx].content + knowledgeBlock,
                };
              } else {
                messages = [
                  { role: "system", content: `你是 ScaleBox 的专业销售助手。${knowledgeBlock}` },
                  ...messages,
                ];
              }
            }
          }

          const override =
            ctx.llmApiKey ?
              { apiKey: ctx.llmApiKey, apiUrl: ctx.llmApiUrl, provider: ctx.llmProvider }
            : undefined;

          const response = await invokeLLM({ messages }, override);
          const firstChoice = response.choices?.[0];
          const content = firstChoice?.message?.content;
          const textContent =
            typeof content === "string"
              ? content
              : Array.isArray(content)
                ? content.map((c: any) => (c.type === "text" ? c.text : "")).join("")
                : "";

          console.log("[ai.generate] success", {
            provider: ctx.llmProvider,
            length: textContent.length,
          });

          return { content: textContent };
        } catch (err: any) {
          console.error("[ai.generate] error", {
            provider: ctx.llmProvider,
            message: err?.message,
            stack: err?.stack,
          });
          throw err;
        }
      }),
  }),

  // ── Knowledge base ─────────────────────────────────────────────────────────
  knowledge: router({
    /** List all uploaded documents (without extractedText for performance) */
    list: publicProcedure.query(async () => {
      return db.listKnowledgeDocs();
    }),

    /** Upload a document: client sends base64-encoded file content */
    upload: publicProcedure
      .input(
        z.object({
          fileName: z.string().min(1).max(512),
          fileType: z.enum(["pdf", "txt", "md", "docx"]),
          fileSize: z.number().int().positive().max(20 * 1024 * 1024), // 20 MB max
          base64Content: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        // Upload to local storage
        const s3Key = `knowledge/${Date.now()}-${randomSuffix()}-${input.fileName}`;
        const mimeMap: Record<string, string> = {
          pdf: "application/pdf",
          txt: "text/plain",
          md: "text/markdown",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
        const fileBuffer = Buffer.from(input.base64Content, "base64");
        const { url: s3Url } = await storagePut(s3Key, fileBuffer, mimeMap[input.fileType] ?? "application/octet-stream");

        // Extract text
        const extractedText = extractTextFromBase64(input.base64Content, input.fileType);

        // Save metadata to file-based store
        const id = await db.createKnowledgeDoc({
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          s3Url,
          s3Key,
          extractedText,
          uploadedBy: null,
        });

        return { id, s3Url, fileName: input.fileName };
      }),

    /** Delete a document by ID */
    delete: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const doc = await db.getKnowledgeDocById(input.id);
        if (!doc) throw new Error("Document not found");
        await db.deleteKnowledgeDoc(input.id);
        return { success: true };
      }),

    /** Get knowledge context summary (for client-side preview) */
    context: publicProcedure.query(async () => {
      const ctx = await db.getKnowledgeContext(2000);
      return { context: ctx, hasContent: ctx.length > 0 };
    }),
  }),
});

export type AppRouter = typeof appRouter;
