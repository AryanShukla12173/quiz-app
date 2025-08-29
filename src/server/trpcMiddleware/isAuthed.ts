// server/trpc/middleware/isAuthed.ts
import { TRPCError } from '@trpc/server';
import { middleware } from '../trpc';

export const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
  }

  return next({
    ctx: {
      // You can include more restricted data if needed
      user: ctx.user,
    },
  });
});
