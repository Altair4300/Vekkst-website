import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Lazy check for ADMIN_PASSWORD — only validate at runtime so the module can be loaded during build
function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    throw new Error("ADMIN_PASSWORD environment variable is required");
  }
  return pw;
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
      const storedPw = getAdminPassword();
      console.log(`[ADMIN_LOGIN] IP: ${ip}, received password length: ${input.password.length}, stored password length: ${storedPw.length}, match: ${input.password === storedPw}`);
      if (!checkRateLimit(ip)) {
        return { success: false, error: "Too many attempts. Try again in 15 minutes." };
      }
      if (input.password !== getAdminPassword()) {
        return { success: false, error: "Invalid password" };
      }
      // Generate admin JWT token
      const token = jwt.sign(
        { role: "admin", isAdmin: true, type: "admin" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return { success: true, token, permissions: "dashboard,quotes,messages,products,media,team" };
    }),

  verify: publicQuery.query(async () => {
    // This is handled by context middleware - if we reach here, token is valid
    return { valid: true };
  }),
});
