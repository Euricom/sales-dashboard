import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";

export const teamleaderRouter = createTRPCRouter({
  getRedirectionURL: protectedProcedure.query(() => {
    return `https://focus.teamleader.eu/oauth2/authorize?client_id=${env.TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${env.TEAMLEADER_REDIRECT_URL}`; // Replace with your desired URL
  }),
});
