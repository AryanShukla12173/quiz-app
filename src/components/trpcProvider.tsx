"use client";

import { trpc } from "@/lib/utils/trpc";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/lib/utils/supabase/client";

const supabase = createClient();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        async headers() {
          const { data } = await supabase.auth.getSession();
          const accessToken = data.session?.access_token;

          return {
            ...(accessToken && {
              Authorization: `Bearer ${accessToken}`,
            }),
          };
        },
      }),
    ],
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
