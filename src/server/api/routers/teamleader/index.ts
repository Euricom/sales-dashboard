import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createDeal, getDeals, updateDealPhase, updateDeal, updateDealPhaseDate, deleteDeal } from "./utils";
import type { SimplifiedDealArray } from "./types";
import { z } from "zod";
import {
  simplifyDeals,
  editDealFields,
  makeUniqueDeals,
  editDealProbablity,
} from "./teamleaderService";

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

      const simpleData: SimplifiedDealArray = await simplifyDeals(
        deals,
        accessToken,
      );
      const uniqueDeals = await makeUniqueDeals(simpleData);
      return { deals: simpleData, uniqueDeals: uniqueDeals };
    } catch (error) {
      console.error("Error in getDealsData:", error);
    }
  }),

  updateDealPhase: protectedProcedure
    .input(z.object({ id: z.string(), phase_id: z.string() }))
    .mutation(async (options) => {
      const accessToken = options.ctx.session.token.accessToken;
      const dealId = options.input.id;
      const phaseId = options.input.phase_id;
      try {
        if (!accessToken) {
          throw new Error("Access token not found");
        }
        const response = await updateDealPhase(accessToken, dealId, phaseId);
        if (!response) {
          throw new Error("Failed to move deal in Teamleader");
        }
        return Promise.resolve({ data: { id: dealId, type: "move" } });
      } catch (error) {
        console.error("Error in moveDeal:", error);
      }
    }),

  updateDeal: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string(),
        phase_id: z.string(),
        name: z.string(),
      }),
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
      const name: string = options.input.name;
      try {
        if (!accessToken) {
          throw new Error("Access token not found");
        }
        const result = await editDealFields(
          accessToken,
          dealId,
          phaseId,
          email,
          name,
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
          const moveResponse = await updateDealPhase(
            accessToken,
            dealId,
            phaseId,
          );
          if (!moveResponse) {
            throw new Error("Failed to move deal in Teamleader");
          }
          return Promise.resolve({
            data: { id: "shouldNotCreate", type: "shouldNotCreate" },
          });
        }
      } catch (error) {
        console.error("Error in updateDeal:", error);
      }
    }),

  updateDealProbability: protectedProcedure
    .input(z.object({ id: z.string(), probability: z.number() }))
    .mutation(async (options) => {
      // get the right deal info
      const accessToken = options.ctx.session.token.accessToken;
      const dealId: string = options.input.id;
      const probability: number = options.input.probability;

      try {
        if (!accessToken) {
          throw new Error("Access token not found");
        }
        const result = await editDealProbablity(
          accessToken,
          dealId,
          probability,
        );
        if (!result) {
          throw new Error("Failed to fetch data from Teamleader");
        }
        const deal = result;

        // update the deal
        const response = await updateDeal(accessToken, deal);
        if (!response) {
          throw new Error("Failed to update deal in Teamleader");
        }
      } catch (error) {
        console.error("Error in updateDealProbability:", error);
      }
    }),

    updatePhaseDate: protectedProcedure.input(z.object({ id: z.string(), phaseId: z.string(), date: z.string() })).mutation(async (options) => {
      const accessToken = options.ctx.session.token.accessToken;
      const dealId = options.input.id;
      const phaseId = options.input.phaseId;
      const date = options.input.date;
      try {
        if (!accessToken) {
          throw new Error("Access token not found");
        }
        const response = await updateDealPhaseDate(dealId, phaseId, date, accessToken);
        if (!response) {
          throw new Error("Failed to move deal in Teamleader");
        }
      } catch (error) {
        console.error("Error in moveDeal:", error);
      }
    }),

    deleteDeal: protectedProcedure.input(z.object({ id: z.string() })).mutation(async (options) => {
      const accessToken = options.ctx.session.token.accessToken;
      const dealId = options.input.id;
      try {
        if (!accessToken) {
          throw new Error("Access token not found");
        }
        const response = await deleteDeal(accessToken, dealId);
        if (!response) {
          throw new Error("Failed to delete deal in Teamleader");
        }
        return Promise.resolve({ data: { id: dealId, type: "delete" } });
      } catch (error) {
        console.error("Error in deal delete:", error);
      }
    })
});


