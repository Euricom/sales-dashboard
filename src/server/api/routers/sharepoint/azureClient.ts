import { ConfidentialClientApplication } from "@azure/msal-node";
import { env } from "~/env";
import { type batchRequestResponse, type batchResponse, type SharePointContact, type SharePointEmployee, type SharePointEmployeeWithAvatar } from "./types";

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

  let employeesWithAvatars: SharePointEmployeeWithAvatar[] | undefined = [];
  if (employeeData.value.length <= 20) {
    employeesWithAvatars = await generateQueryBody(employeeData, token);
  } else {
    employeesWithAvatars = await Promise.all(
    employeeData.value.map(async (employee: SharePointEmployee) => {
      const avatarString = await getEmployeeAvatar(token, employee.fields.Euricom_x0020_email) ?? null;
      return {
        ...employee,
        fields: {
          ...employee.fields,
          avatar: avatarString,
        },
      };
    })
  );
  }

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

const generateQueryBody = async (employeeData : SharePointContact, accessToken: string) => {

  const requests = employeeData.value.map((employee) => {
    return {
      id: employee.id,
      method: "GET",
      url: `/users/${employee.fields.Euricom_x0020_email}/photo/$value`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly", 
      }
  }});

  const url = "https://graph.microsoft.com/v1.0/$batch";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly",
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requests: requests,
    })
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to fetch data from SharePoint");
    }

    const data = await response.json() as batchRequestResponse;
    const employeesWithAvatars: SharePointEmployeeWithAvatar[] = employeeData.value.map((employee: SharePointEmployee) => {
      const avatar = data.responses.find((response: batchResponse) => response.id === employee.id);
      return {
        ...employee,
        fields: {
          ...employee.fields,
          avatar: avatar?.body ?? null,
        },
      };
    });
    
    return employeesWithAvatars;

  } catch (error) {
    console.error(error);
  }
}