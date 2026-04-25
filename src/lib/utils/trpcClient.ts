// lib/trpcClient.ts
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server";
import { getAuthToken } from "@/lib/auth/session";

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      headers() {
        const accessToken = getAuthToken();

        return {
          ...(accessToken && {
            Authorization: `Bearer ${accessToken}`,
          }),
        };
      },
    }),
  ],
});
