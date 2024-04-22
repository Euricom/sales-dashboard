import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createDeal,
  editDealFields,
  getDeals,
  moveDeal,
  simplifyDeals,
  updateDeal,
} from "./utils";
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

      const simpleData: SimplifiedDealArray = await simplifyDeals(deals, accessToken);
      return simpleData;
    } catch (error) {
      console.error("Error in getDealsData:", error);
    }
  }),

  updateDeal: protectedProcedure
    .input(
      z.object({ id: z.string(), email: z.string(), phase_id: z.string() }),
    )
    .output(
      z.promise(
        z.object({ data: z.object({ id: z.string(), type: z.string() }) }),
      ),
    )
    .mutation(async (options) => {
      // get the right deal info
      const accessToken = options.ctx.session.token.accessToken;
      const dealId: string = options.input.id;
      const email: string = options.input.email;
      const phaseId: string = options.input.phase_id;
      try {
        if (!accessToken) {
          throw new Error("Access token not found");
        }
        const result = await editDealFields(
          accessToken,
          dealId,
          phaseId,
          email,
        );
        if (!result) {
          throw new Error("Failed to fetch data from Teamleader");
        }
        const { deal, shouldCreate } = result;

        // update or create a deal in TL depending on isDuplicate
        if (shouldCreate) {
          // create a new deal
          const response = await createDeal(accessToken, deal, phaseId);
          if (!response) {
            throw new Error("Failed to create deal in Teamleader");
          }
          return response.json();
        } else {
          // update the deal
          const response = await updateDeal(accessToken, deal);
          if (!response) {
            throw new Error("Failed to update deal in Teamleader");
          }
          // move the deal to the right phase
          const moveResponse = await moveDeal(accessToken, dealId, phaseId);
          if (!moveResponse) {
            throw new Error("Failed to move deal in Teamleader");
          }
          return Promise.resolve({
            data: { id: "shouldNotCreate", type: "shouldNotCreate" },
          });
        }
      } catch (error) {
        console.error("Error in getDealInfo:", error);
      }
    }),
});
