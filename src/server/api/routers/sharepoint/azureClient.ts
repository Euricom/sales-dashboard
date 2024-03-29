import { ConfidentialClientApplication } from "@azure/msal-node";
import { env } from "~/env";
import { type SharePointContact, type SharePointEmployee, type SharePointEmployeeWithAvatar } from "./types";

const CONTACT_LIST_ID = "dda5396a-4f95-4d63-b9ae-3ce4e6fc0fcf";
export const azureClient = new ConfidentialClientApplication({
  auth: {
    clientId: env.AZURE_AD_CLIENT_ID,
    clientSecret: env.AZURE_AD_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}`,
  },
});

export const getAllEmployeeData = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error("Failed to get token");
  }
  const employeeData = await getEmployeesData(token);
  if (!employeeData) {
    throw new Error("Failed to get employee data");
  }
  const employeesWithAvatars: SharePointEmployeeWithAvatar[] = await Promise.all(
    employeeData.value.map(async (employee: SharePointEmployee) => {
      const avatarString = await getEmployeeAvatar(token, employee.fields.Euricom_x0020_email) ?? "";
      return {
        ...employee,
        fields: {
          ...employee.fields,
          avatar: avatarString,
        },
      };
    })
  );
  
  return employeesWithAvatars;
};


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
    "Euricom_x0020_email",
    "Job_x0020_title",
    "Level",
    "Status",
    "Contract_x0020_Substatus",
  ];
  const fieldsString = fields.join(",");
  const url = `https://graph.microsoft.com/v1.0/sites/root/lists/${CONTACT_LIST_ID}/items?$select=id&$expand=fields($select=${fieldsString})&$filter=fields/Status eq 'Bench' or fields/Status eq 'Starter' or fields/Contract_x0020_Substatus eq 'End Of Contract' or fields/Contract_x0020_Substatus eq 'Open For New Opportunities'`;

  //console.log(url, "url in azureClient.ts");
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

/* 
for the user avatar url:
https://graph.microsoft.com/v1.0/users/{email}/photo/$value
bvb.: https://graph.microsoft.com/v1.0/users/Bart.Debeuckelaere@euri.com/photo/$value
*/

export const getEmployeeAvatar = async (accessToken: string, email: string) => {
  const url = `https://graph.microsoft.com/v1.0/users/${email}/photo/$value`;
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

    const data = await response.arrayBuffer();
    const base64Data = Buffer.from(data).toString('base64');
    return base64Data;
  } catch (error) {
    console.error(error);
  }
};