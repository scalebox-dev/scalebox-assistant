import { z } from "zod";
import { getLlmConfig, setLlmConfig } from "./runtimeConfig";
import { notifyOwner } from "./notification";
import { publicProcedure, router } from "./trpc";

export const systemRouter = router({
  getLlmConfig: publicProcedure.query(() => {
    const { llmApiUrl, llmApiKey } = getLlmConfig();
    return { llmApiUrl: llmApiUrl ?? "", hasKey: Boolean(llmApiKey && llmApiKey.trim()) };
  }),

  setLlmConfig: publicProcedure
    .input(
      z.object({
        llmApiUrl: z.string().optional(),
        llmApiKey: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      setLlmConfig({
        llmApiUrl: input.llmApiUrl,
        llmApiKey: input.llmApiKey,
      });
      return { success: true };
    }),

  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }),
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
