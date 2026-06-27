import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Lazy check for ADMIN_PASSWORD — required in production
function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    console.warn("[ADMIN] ADMIN_PASSWORD not set");
    return "";
  }
  // Trim whitespace and remove surrounding quotes that might be accidentally added in Railway
  let cleaned = pw.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  if (!cleaned) {
    console.warn("[ADMIN] ADMIN_PASSWORD is empty after cleanup");
    return "";
  }
  return cleaned;
}

// Simple rate limiter: max 5 attempts per 15 minutes per IP
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  record.count++;
  return true;
}

export const adminAuthRouter = createRouter({
  login: publicQuery
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown";
      
      if (!checkRateLimit(ip)) {
        return { success: false, error: "Too many attempts. Try again in 15 minutes." };
      }
      
      const storedPw = getAdminPassword();
      if (!storedPw) {
        return { success: false, error: "Server misconfiguration." };
      }
      
      const inputPw = input.password.trim();
      if (!inputPw) {
        return { success: false, error: "Password is required" };
      }
      
      if (inputPw !== storedPw) {
        return { success: false, error: "Invalid password" };
      }
      
      // Generate admin JWT token
      const token = jwt.sign(
        { role: "admin", isAdmin: true, type: "admin" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return { success: true, token, permissions: "dashboard,quotes,messages,products,media,team,pages" };
    }),

  verify: publicQuery.query(async () => {
    return { valid: true };
  }),
});
