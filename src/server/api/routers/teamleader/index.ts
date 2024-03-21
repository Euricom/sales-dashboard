import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { getDeals, simplifyDeals } from "./utils";
import type { SimplifiedDealArray } from "./types";
import { authOptions, getServerAuthSession, getAuthToken } from "~/server/auth"; // Import the function to get the server auth session

export const teamleaderRouter = createTRPCRouter({
  getRedirectionURL: protectedProcedure.query(() => {
    return `https://focus.teamleader.eu/oauth2/authorize?client_id=${env.TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${env.TEAMLEADER_REDIRECT_URL}`; // Replace with your desired URL
  }),

  getDealsData: protectedProcedure.query(async (options) => {
    const { input, ctx } = options;
    // Retrieve the token from
    console.log("HELLO I AM HERE");
    const token = getAuthToken();
    console.log("Token:", token);
    // Use the access token from the session to make API calls
    const accessToken = "token.";
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

  // refreshAccessToken: protectedProcedure
  //   .input(z.string())
  //   .query(async (refreshToken) => {
  //     try {
  //       if (!refreshToken) {
  //         throw new Error("refresh token not found");
  //       }
  //       const tokens = await refreshAccessToken(refreshToken.input);
  //       return tokens;
  //     } catch (error) {
  //       console.error("Error in getDeals:", error);
  //     }
  //   }),
});
