import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vekkst-secret-key";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "superadmin2025";

export const adminAuthRouter = createRouter({
  login: publicQuery
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      if (input.password !== ADMIN_PASSWORD) {
        return { success: false, error: "Invalid password" };
      }
      // Generate admin JWT token
      const token = jwt.sign(
        { role: "admin", isAdmin: true, type: "admin" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return { success: true, token };
    }),

  verify: publicQuery.query(async () => {
    // This is handled by context middleware - if we reach here, token is valid
    return { valid: true };
  }),
});
