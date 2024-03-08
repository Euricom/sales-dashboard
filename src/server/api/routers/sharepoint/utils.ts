import { ConfidentialClientApplication } from "@azure/msal-node";
import { env } from "~/env";
import { type SharePointContact } from "./types";

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
  /** Graph query to get all employees with status 'Bench', 'Starter', 'End Of Contract' or 'Open For New Opportunities' and selecting only the necessary fields
   * items?
   * $select=id
   * &
   * $expand=
   *    fields($select=
   *            Title,
   *            City,
   *            Job_x0020_title,
   *            Level,
   *            Status,
   *            Contract_x0020_Substatus
   *    )
   * &
   * $filter=
   *    fields/Status eq 'Bench'
   *    or fields/Status eq 'Starter'
   *    or fields/Contract_x0020_Substatus eq 'End Of Contract'
   *    or fields/Contract_x0020_Substatus eq 'Open For New Opportunities'
   */
  const fields = [
    "Title",
    "City",
    "Job_x0020_title",
    "Level",
    "Status",
    "Contract_x0020_Substatus",
  ];
  const fieldsString = fields.join(",");
  const url = `https://graph.microsoft.com/v1.0/sites/root/lists/${CONTACT_LIST_ID}/items?$select=id&$expand=fields($select=${fieldsString})&$filter=fields/Status eq 'Bench' or fields/Status eq 'Starter' or fields/Contract_x0020_Substatus eq 'End Of Contract' or fields/Contract_x0020_Substatus eq 'Open For New Opportunities'`;

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly", // Bypass the warning for non-indexed queries
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to fetch data from SharePoint");
    }
    const data: SharePointContact =
      (await response.json()) as unknown as SharePointContact;
    return data;
  } catch (error) {
    console.error(error);
  }
};
