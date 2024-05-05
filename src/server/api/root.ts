import { createTRPCRouter } from "~/server/api/trpc";
import { teamleaderRouter } from "./routers/teamleader";
import { mongodbRouter } from "./routers/mongodb";
import { mailRouter } from "./routers/mail";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  teamleader: teamleaderRouter,
  mongodb: mongodbRouter,
  mailer: mailRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
