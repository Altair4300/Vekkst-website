import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

// Rate limiting: max 10 translations per minute per IP
const translateAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_TRANSLATE = 10;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = translateAttempts.get(ip);
  if (!record || now > record.resetAt) {
    translateAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_TRANSLATE) return false;
  record.count++;
  return true;
}

export const translationRouter = createRouter({
  translate: publicQuery
    .input(z.object({
      text: z.string().min(1).max(1000),
      target: z.string().min(2).max(5),
      source: z.string().min(2).max(5).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown";
      if (!checkRateLimit(ip)) {
        return { success: false, error: "Rate limit exceeded. Try again later.", translated: "" };
      }

      try {
        // Use LibreTranslate API (free, no key required for basic usage)
        const response = await fetch("https://libretranslate.de/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: input.text,
            source: input.source || "auto",
            target: input.target,
            format: "text",
          }),
        });

        if (!response.ok) throw new Error("Translation service error");
        const data = await response.json();
        return { success: true, translated: data.translatedText || input.text };
      } catch {
        return { success: false, error: "Translation failed", translated: input.text };
      }
    }),
});
