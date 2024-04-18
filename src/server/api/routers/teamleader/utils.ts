import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { env } from "~/env";
import type { User, Deal, Company, Tokens, SimplifiedDealArray, dataObject, Phase, DealInfo } from "./types";

interface EditDealFieldsResult {
  deal: DealInfo; // replace DealType with the actual type of `deal`
  isEmailPresent: boolean;
}

export const handleURLReceived = (url: string, router: AppRouterInstance): string => {
  let code: string | null = null;
  // Extract the refresh token from the redirected URL
  if (window.location.href != "http://localhost:3000/") {
    const urlParams = new URLSearchParams(window.location.href.split("?")[1]);
    code = urlParams.get("code") ?? "";
  }

  if (code == null) {
    router.push(url);
  }

  return code ?? "";
};

export const refreshAccessToken = async (refreshToken: string) => {
  const url = `${env.TEAMLEADER_ACCESS_TOKEN_URL}`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
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
    console.error('Error in getDeals:',error);
  }
};

export const getDeals = async (accessToken: string) => {
  const url = `${env.TEAMLEADER_API_URL}/deals.list`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          ids:  ["ebcc7d5f-d585-01de-9373-fb2c11879ee7"
          ,"bad7b32f-2fcd-0d28-ba76-0a8221879ed5"
          ,"7725d0fe-cc29-01e1-9a75-f74461879ec1"
         ],
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
      console.error('Error in getDeals:',error);
    }
};

const getCompanyLogo = async (url : string) => {
  if (url === "") return null;
  // for some reason the url for this site isn't correct in Teamleader. As soon as it's fixed this will be deleted.
  if (url === "http:\/\/www.district09.be") url = "http://www.district09.gent";

  const response = await fetch(` http://www.google.com/s2/favicons?domain_url=${url}&sz=64`);
  // er zijn nog een aantal favicon urls die niet kunnen worden opgehaald.
  // die ga ik hier proberen ophalen op een andere manier.
  if (!response.ok) {
    return `${url}/favicon.ico`
  }
  return response.url;
};

export const simplifyDeals = async (dealsObject: dataObject): Promise<SimplifiedDealArray> => {
  if (!dealsObject || typeof dealsObject !== 'object') {
      console.error('Data, users, or companies is not an object or is null/undefined');
      return [];
  }
  // put deals, users, and companies in variables
  const deals = dealsObject.data;
  const users = dealsObject.included.user;
  const companies = dealsObject.included.company;
  const phases = dealsObject.included.dealPhase;

  if (!Array.isArray(deals) || !Array.isArray(users) || !Array.isArray(companies)) {
      console.error('deals, users or companies is not an array');
      return [];
  }
  

  const simplifiedDeals = await Promise.all(deals.map(async (deal: Deal) => {
      const dealId: string = deal.id;
      const userId: string = deal.responsible_user.id;
      const companyId: string = deal.lead?.customer?.id;
      const phaseId: string = deal.current_phase.id;
      // find the user and company that are responsible for the deal
      const user = users.find((user: User) => user.id === userId);
      const company = companies.find((company: Company) => company.id === companyId);
      const phase = phases.find((phase: Phase) => phase.id === phaseId);
      if (!user) {
        console.log(`User not found for deal ID: ${dealId}`);
      }
      if (!company) {
          console.log(`Company not found for deal ID: ${dealId}`);
      }
      if (!phase) {
          console.log(`Phase not found for deal ID: ${dealId}`);
      }

      const favicon = await getCompanyLogo(company?.website ?? "");

      // return the simplified deal
      return {
        id: deal.id,
        title: deal.title,
        estimated_closing_date: deal.estimated_closing_date ?? "",
        deal_phase: {
            id: phase?.id ?? null,
            name: phase?.name ?? null,
        },
        company: {
            id: company?.id ?? null,
            name: company?.name ?? null,
            logo_url: favicon,
        },
        PM: {
            id: user?.id ?? null,
            first_name: user?.first_name ?? null,
            last_name: user?.last_name ?? null,
            avatar_url: user?.avatar_url ?? null,
        },
      };
  }));
  
  // remove null values and sort the deals by estimated_closing_date
  const sortedDeals = simplifiedDeals
  .filter(deal => deal !== null)
  .sort((a, b) => {
    if (!a.estimated_closing_date) return 1; // a is put last
    if (!b.estimated_closing_date) return -1; // b is put last
    return new Date(a.estimated_closing_date).getTime() - new Date(b.estimated_closing_date).getTime();
  }) as SimplifiedDealArray;

  return sortedDeals;
}

export const getDeal = async (accessToken: string, dealId: string) => {
  const url = `${env.TEAMLEADER_API_URL}/deals.info`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
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
    console.error('Error in getDeal:',error);
  }
};

export const editDealFields = async (accessToken: string, dealId: string, phaseId: string, email: string): Promise<EditDealFieldsResult| null>=> {
  let isEmailPresent = false;
  const deal = await getDeal(accessToken, dealId);
  if (!deal) return null;


  const emailFieldId = deal.included.customFieldDefinition.find((field) => field.label=== "E-mail consultant")?.id;

  if (deal.data.custom_fields) {
    deal.data.custom_fields.forEach((field) => {
      if (field.definition.id === emailFieldId) {
        if (field.value !== null) {
          isEmailPresent = true;
        }
        field.value = email;
      }
    });
    deal.data.current_phase.id = phaseId;
  }
  return {deal, isEmailPresent};
}

export const updateDeal = async (accessToken: string, dealId: string, phaseId: string, email: string) => {

  return null;
}