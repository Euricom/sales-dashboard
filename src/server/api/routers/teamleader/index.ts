import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import z from "zod";
import { get } from "http";

export const teamleaderRouter = createTRPCRouter({
  getRedirectionURL: protectedProcedure.query(() => {
    return `https://focus.teamleader.eu/oauth2/authorize?client_id=${env.TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${env.TEAMLEADER_REDIRECT_URL}`; // Replace with your desired URL
  }),

  getDeals: protectedProcedure.input(z.string()).query(async (authCode) => {
    getAccessToken(authCode);
    // const url = `${env.TEAMLEADER_API_URL}/deals`;
    // const options: RequestInit = {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${env.TEAMLEADER_ACCESS_TOKEN}`,
    //   },
    // };
    // try {
    //   const response = await fetch(url, options);
    //   if (!response.ok) {
    //     console.error("Failed to fetch data from Teamleader");
    //   }
    //   const data = (await response.json()) as unknown as unknown[];
    //   return data;
    // } catch (error) {
    //   console.error(error);
    // }
  }),

  getAccessToken: protectedProcedure
    .input(z.string())
    .query(async (authCode) => {
      console.log(authCode, "authCode 1");
      const url = `${env.TEAMLEADER_ACCESS_TOKEN_URL}`;
      const options: RequestInit = {
        method: "POST",headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.TEAMLEADER_CLIENT_ID,
          client_secret: env.TEAMLEADER_CLIENT_SECRET,
          code: String(authCode), // Convert authCode to string
          grant_type: 'authorization_code',
          redirect_uri: env.TEAMLEADER_REDIRECT_URL,
        }),
      };
      console.log(options);
      try {
        console.log(authCode, "authCode 2");
        const response = await fetch(url, options);
        if (!response.ok) {
          console.error("Failed to fetch data from Teamleader");
        }
        console.log(response, "response from Teamleader");
        // const data: SharePointContact = (await response.json()) as unknown as SharePointContact;
        // console.log(data);
        return response;
      } catch (error) {
        console.error(error);
      }
    }),
});
