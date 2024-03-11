import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import z from "zod";
import { getDeals, getUsers, refreshAccessToken, simplifyDeals } from "./utils";
import type {SimplifiedDeal} from "./types";

export const teamleaderRouter = createTRPCRouter({
  getRedirectionURL: protectedProcedure.query(() => {
    return `https://focus.teamleader.eu/oauth2/authorize?client_id=${env.TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${env.TEAMLEADER_REDIRECT_URL}`; // Replace with your desired URL
  }),

  getDealsData : protectedProcedure.input(z.string()).query(async (accessToken) => {
    try {
      if (!accessToken) {
        throw new Error("Access token not found");
      }
      const deals = await getDeals(accessToken.input);
      const users = await getUsers(accessToken.input);
      //console.log(deals);
      if (!deals || !users) {
        throw new Error("Failed to fetch data from Teamleader");
      }

      const simpleData: SimplifiedDeal[] = await simplifyDeals(deals, users, accessToken.input) as SimplifiedDeal[];
      //console.log(simpleData);
      return simpleData;
    } catch (error) {
      console.error('Error in getDealsData:',error);
    }
  }),

  refreshAccessToken: protectedProcedure.input(z.string()).query(async (refreshToken) => {
    try {
      if (!refreshToken) {
      throw new Error("refresh token not found");
      }
      const tokens = await refreshAccessToken(refreshToken.input);
      return tokens;
    } catch (error) {
      console.error('Error in getDeals:',error);
    }
  }),

});
