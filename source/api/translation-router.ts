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

      // Try LibreTranslate first (free, no key)
      try {
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
        if (response.ok) {
          const data = await response.json();
          if (data.translatedText) {
            return { success: true, translated: data.translatedText };
          }
        }
      } catch (e) {
        console.warn("[TRANSLATE] LibreTranslate failed, trying fallback...");
      }

      // Fallback 1: MyMemory API (free, no key, 1000 requests/day)
      // Note: MyMemory doesn't support "auto" source - use "en" as default or detect simple cases
      try {
        const sourceLang = (input.source && input.source !== "auto") ? input.source : "en";
        const targetLang = input.target;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input.text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          if (data.responseData?.translatedText && 
              data.responseData.translatedText !== input.text &&
              !data.responseData.translatedText.includes("INVALID SOURCE LANGUAGE")) {
            return { success: true, translated: data.responseData.translatedText };
          }
        }
      } catch (e) {
        console.warn("[TRANSLATE] MyMemory fallback failed...");
      }

      // Fallback 2: Simply return original text (graceful degradation)
      return { success: false, error: "Translation services unavailable. Displaying original text.", translated: input.text };
    }),
});
