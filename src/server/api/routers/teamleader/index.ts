import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import z from "zod";
import { getDeals, simplifyDeals } from "./utils";

export const teamleaderRouter = createTRPCRouter({
  getRedirectionURL: protectedProcedure.query(() => {
    return `https://focus.teamleader.eu/oauth2/authorize?client_id=${env.TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${env.TEAMLEADER_REDIRECT_URL}`; // Replace with your desired URL
  }),

  getDeals: protectedProcedure.input(z.string()).query(async (accessToken) => {
    try {
      if (!accessToken) {
      throw new Error("Access token not found");
      }
      const deals = getDeals(accessToken.input);
    } catch (error) {
      console.error('Error in getDeals:',error);
    }
  }),

  getDealsData : protectedProcedure.input(z.string()).query(async (accessToken) => {
    try {
      if (!accessToken) {
        throw new Error("Access token not found");
      }
      const deals = await getDeals(accessToken.input);
      //console.log(deals);
      if (!deals) {
        throw new Error("Failed to fetch data from Teamleader");
      }

      const simpleData = await simplifyDeals(deals, accessToken.input);
      console.log(simpleData);
    } catch (error) {
      console.error('Error in getDealsData:',error);
    }
  }),

});
