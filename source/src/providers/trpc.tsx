import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // data stays fresh for 5 minutes
      refetchOnWindowFocus: false,   // don't re-fetch when switching tabs
      retry: 1,                       // only retry once on failure
      retryDelay: 2000,               // wait 2 seconds between retries
    },
  },
});
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const headers: Record<string, string> = {};
        const userToken = localStorage.getItem("local_auth_token");
        if (userToken) {
          headers["x-local-auth-token"] = userToken;
        }
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
