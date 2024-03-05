import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import z from "zod";

export const teamleaderRouter = createTRPCRouter({
  getRedirectionURL: protectedProcedure.query(() => {
    return `https://focus.teamleader.eu/oauth2/authorize?client_id=${env.TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${env.TEAMLEADER_REDIRECT_URL}`; // Replace with your desired URL
  }),

  getDeals: protectedProcedure.input(z.string()).query(async (accessToken) => {
    const url = `${env.TEAMLEADER_API_URL}/deals.list`;
    const options: RequestInit = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.input}`,
      },
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error("Failed to fetch data from Teamleader");
      }
      const data = await response.json() as unknown as unknown[];
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error in getDeals:',error);
    }
  }),

  getAccessToken: protectedProcedure
    .input(z.string())
    .query(async (authCode) => {
      if (authCode !== undefined && authCode !== null) {
        console.log(authCode.input);
      } else {
        console.log('authCode is undefined or null');
      }
      const url = `${env.TEAMLEADER_ACCESS_TOKEN_URL}`;
      const options: RequestInit = {
        method: "POST",headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.TEAMLEADER_CLIENT_ID ?? "",
          client_secret: env.TEAMLEADER_CLIENT_SECRET ?? "",
          code: String(authCode), // Convert authCode to string
          grant_type: 'authorization_code',
          redirect_uri: env.TEAMLEADER_REDIRECT_URL ?? "",
        }),
      };
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          console.error("Failed to fetch data from Teamleader");
        }
        const data = await response.json() as unknown as unknown[];
        console.log(data);
        return data;
      } catch (error) {
        console.error('Error in getAccessToken:',error);
      }
    }),
});
