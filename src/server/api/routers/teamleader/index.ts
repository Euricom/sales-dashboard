import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getDeals, simplifyDeals } from "./utils";
import type { SimplifiedDealArray } from "./types";

export const teamleaderRouter = createTRPCRouter({
  getDealsData: protectedProcedure.query(async (options) => {
    // Use the access token from the session to make API calls
    // console.log(options.ctx.token,"tokens in trpc router")
    const accessToken = options.ctx.session.token.accessToken;
    try {
      if (!accessToken) {
        throw new Error("Access token not found");
      }
      const deals = await getDeals(accessToken);
      if (!deals) {
        throw new Error("Failed to fetch data from Teamleader");
      }

      const simpleData: SimplifiedDealArray = await simplifyDeals(deals);
      return simpleData;
    } catch (error) {
      console.error("Error in getDealsData:", error);
    }
  }),
});
