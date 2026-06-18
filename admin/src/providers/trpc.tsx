import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../../source/api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // data stays fresh for 5 minutes
      refetchOnWindowFocus: false,  // don't re-fetch when switching tabs
      retry: 1,                      // only retry once on failure
      retryDelay: 2000,              // wait 2 seconds between retries
    },
  },
});

// VITE_API_URL can be set to point at the backend in production,
// e.g. https://api.yourdomain.com. Falls back to a relative /api/trpc
// path which works when the dev-server proxy is active.
let apiBaseUrl = import.meta.env.VITE_API_URL;
if (apiBaseUrl && !apiBaseUrl.startsWith("http://") && !apiBaseUrl.startsWith("https://")) {
  apiBaseUrl = `https://${apiBaseUrl}`;
}
const apiBase = apiBaseUrl ? `${apiBaseUrl}/api/trpc` : "/api/trpc";
console.log("[TRPC] API URL:", apiBase, "Raw VITE_API_URL:", import.meta.env.VITE_API_URL);

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiBase,
      transformer: superjson,
      headers() {
        const headers: Record<string, string> = {};
        const adminToken = localStorage.getItem("admin_auth_token");
        if (adminToken) {
          headers["x-admin-token"] = adminToken;
        }
        return headers;
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
