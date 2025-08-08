import { appRouter } from '@/server/index'; // your main router
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import { type NextResponse } from 'next/server';


const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: req,
    router: appRouter,
    createContext: async () => {
      const supabase = createClient(
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
    },
  });
};

export { handler as GET, handler as POST };
