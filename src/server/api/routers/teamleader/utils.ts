import { env } from "~/env";
import type { Tokens, dataObject, DealInfo } from "./types";

export const refreshAccessToken = async (refreshToken: string) => {
  const url = `${env.TEAMLEADER_ACCESS_TOKEN_URL}`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: `${env.TEAMLEADER_CLIENT_ID}`,
      client_secret: `${env.TEAMLEADER_CLIENT_SECRET}`,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to refresh the access token from Teamleader");
    }
    const data = (await response.json()) as unknown as Tokens;
    return data;
  } catch (error) {
    console.error("Error in getDeals:", error);
  }
};

export const getDeals = async (accessToken: string) => {
  const url = `${env.TEAMLEADER_API_URL}/deals.list`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        // responsible_user_id: "bcc33953-e3fe-0913-b552-050ab1b47456",
        status: ["open"],
      },
      page: {
        size: 100,
      },
      include: "lead.customer,responsible_user,current_phase",
    }),
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to fetch data from Teamleader");
    }
    const data = (await response.json()) as dataObject;
    return data;
  } catch (error) {
    console.error("Error in getDeals:", error);
  }
};

export const getCompanyLogo = async (url: string) => {
  if (url === "") return null;

  const response = await fetch(
    ` http://www.google.com/s2/favicons?domain_url=${url}&sz=64`,
  );
  // er zijn nog een aantal favicon urls die niet kunnen worden opgehaald.
  // die ga ik hier proberen ophalen op een andere manier.
  if (!response.ok) {
    return `${url}/favicon.ico`;
  }
  return response.url;
};

export const getDeal = async (accessToken: string, dealId: string) => {
  const url = `${env.TEAMLEADER_API_URL}/deals.info`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: dealId,
      include: "custom_fields.definition",
    }),
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to fetch data from Teamleader");
    }
    const data = (await response.json()) as DealInfo;
    return data;
  } catch (error) {
    console.error("Error in getDeal:", error);
  }
};

export const updateDeal = async (accessToken: string, deal: DealInfo) => {
  const url = `${env.TEAMLEADER_API_URL}/deals.update`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: deal.data.id,
      lead: {
        customer: {
          type: deal.data.lead.customer.type,
          id: deal.data.lead.customer.id,
        },
        constact_person: null,
      },
      title: deal.data.title,
      summary: deal.data.summary,
      source_id: deal.data.source?.id,
      department_id: deal.data.department?.id,
      responsible_user_id: deal.data.responsible_user.id,
      estimated_value: {
        amount: deal.data.estimated_value.amount,
        currency: deal.data.estimated_value.currency,
      },
      estimated_probability: deal.data.estimated_probability,
      estimated_closing_date: deal.data.estimated_closing_date,
      custom_fields: deal.data.custom_fields.map((field) => ({
        id: field.definition.id,
        value: field.value,
      })),
    }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to update deal in Teamleader");
    }
    const data = response;
    return data;
  } catch (error) {
    console.error("Error in moveDeal:", error);
  }
};

export const createDeal = async (
  accessToken: string,
  deal: DealInfo,
  phase_id: string,
) => {
  const url = `${env.TEAMLEADER_API_URL}/deals.create`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lead: {
        customer: {
          type: deal.data.lead.customer.type,
          id: deal.data.lead.customer.id,
        },
        constact_person: null,
      },
      title: deal.data.title,
      summary: deal.data.summary ?? "",
      source_id: deal.data.source?.id ?? "a33798cb-401f-0a42-b342-ee0d12ab5cf7",
      department_id: deal.data.department?.id,
      responsible_user_id: deal.data.responsible_user.id,
      phase_id: phase_id,
      estimated_value: {
        amount: 0,
        currency: deal.data.estimated_value.currency,
      },
      estimated_probability: deal.data.estimated_probability,
      estimated_closing_date: deal.data.estimated_closing_date ?? "1950-06-19",
      custom_fields: deal.data.custom_fields.map((field) => ({
        id: field.definition.id,
        value: field.value,
      })),
    }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to create deal in Teamleader");
    }

    const data = response;
    return data;
  } catch (error) {
    console.error("Error in updateDeal:", error);
  }
};

export const updateDealPhase = async (
  accessToken: string,
  dealId: string,
  phaseId: string,
) => {
  const url = `${env.TEAMLEADER_API_URL}/deals.move`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: dealId,
      phase_id: phaseId,
    }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error("Failed to update deal phase in Teamleader");
    }
    const data = response;
    return data;
  } catch (error) {
    console.error("Error in updateDealPhase:", error);
  }
};
