import { createTRPCRouter } from "~/server/api/trpc";
import { sharePointRouter } from "./routers/sharepoint";
import { teamleaderRouter } from "./routers/teamleader";
import { mongodbRouter } from "./routers/mongodb";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  sharePoint: sharePointRouter,
  teamleader: teamleaderRouter,
  mongodb: mongodbRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
