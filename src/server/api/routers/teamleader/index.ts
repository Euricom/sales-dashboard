import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { changeDeal, getDeals, simplifyDeals } from "./utils";
import type { SimplifiedDealArray } from "./types";
import { z } from "zod";

export const teamleaderRouter = createTRPCRouter({
  getDealsData: protectedProcedure.query(async (options) => {
    // Use the access token from the session to make API calls
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

  getDealAndMutate: protectedProcedure.input(z.object({id: z.string(), email: z.string(), phase_id: z.string()})).query(async (options) => {
    const accessToken = options.ctx.session.token.accessToken;
    const dealId: string = options.input.id;
    const email: string = options.input.email;
    const phaseId: string = options.input.phase_id;
    try {
      if (!accessToken) {
        throw new Error("Access token not found");
      }
      const result = await changeDeal(accessToken, dealId, phaseId, email);
      if (!result) {
        throw new Error("Failed to fetch data from Teamleader");
      }
      const { data, isDuplicate } = result;
      return {data, isDuplicate};

    } catch (error) {
      console.error("Error in getDealInfo:", error);
    }
  }),

});
