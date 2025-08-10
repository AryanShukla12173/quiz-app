import { createClient } from "@/lib/utils/supabase/server";
import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;

  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVER_KEY!
  );

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let user = null;
  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('Auth error:', error.message);
      throw new Error('Invalid token');
    }
    user = data.user;
  }

  return { supabase, user };
};
const t = initTRPC
  .context<Awaited<ReturnType<typeof createContext>>>()
  .create();
export const router = t.router;
export const middleware = t.middleware
export const publicProcedure = t.procedure;