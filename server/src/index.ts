
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import { createFoodEntryInputSchema } from './schema';
import { createFoodEntry } from './handlers/create_food_entry';
import { getFoodEntries } from './handlers/get_food_entries';
import { getDailyCalories } from './handlers/get_daily_calories';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  createFoodEntry: publicProcedure
    .input(createFoodEntryInputSchema)
    .mutation(({ input }) => createFoodEntry(input)),
    
  getFoodEntries: publicProcedure
    .query(() => getFoodEntries()),
    
  getDailyCalories: publicProcedure
    .input(z.object({ date: z.string().optional() }).optional())
    .query(({ input }) => getDailyCalories(input?.date)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
