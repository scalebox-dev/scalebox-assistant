import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

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
        }),
      )
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: input.messages,
        });
        const firstChoice = response.choices?.[0];
        const content = firstChoice?.message?.content;
        const textContent = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => (c.type === "text" ? c.text : "")).join("") : "";
        return { content: textContent };
      }),
  }),
});

export type AppRouter = typeof appRouter;
