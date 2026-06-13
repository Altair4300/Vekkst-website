import { router } from "./trpc";
import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { productRouter } from "./product-router";
import { quoteRouter } from "./quote-router";
import { adminRouter } from "./admin-router";
import { adminAuthRouter } from "./admin-auth-router";
import { messageRouter } from "./message-router";
import { mediaRouter } from "./media-router";

export const appRouter = router({
  auth: authRouter,
  localAuth: localAuthRouter,
  product: productRouter,
  quote: quoteRouter,
  admin: adminRouter,
  adminAuth: adminAuthRouter,
  message: messageRouter,
  media: mediaRouter,
});

export type AppRouter = typeof appRouter;
