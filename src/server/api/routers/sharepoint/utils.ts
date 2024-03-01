import { ConfidentialClientApplication } from "@azure/msal-node";
import { env } from "~/env";
import { SharePointContact } from "./types";

const CONTACT_LIST_ID = "dda5396a-4f95-4d63-b9ae-3ce4e6fc0fcf";
export const azureClient = new ConfidentialClientApplication({
  auth: {
    clientId: env.AZURE_AD_CLIENT_ID,
    clientSecret: env.AZURE_AD_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}`,
  },
});

export const getToken = async () => {
  const token = await azureClient.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });
  return token?.accessToken;
};

export const getEmployeesData = async (accessToken: string | undefined) => {
  const url = `https://graph.microsoft.com/v1.0/sites/root/lists/${CONTACT_LIST_ID}/items`;

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to fetch data from SharePoint");
    }
    const data: SharePointContact =
      (await response.json()) as unknown as SharePointContact;
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};
