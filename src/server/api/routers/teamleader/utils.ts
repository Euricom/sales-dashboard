import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { env } from "~/env";
import { type User, type Deal, type Company, type Tokens} from "./types";

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
        sort: [
          {
            field: "created_at",
            order: "desc"
          }
        ],
        page: {
          size: 10
        },
      }),
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error("Failed to fetch data from Teamleader");
      }
      const data = (await response.json()) as unknown as Deal[];
      return data;
    } catch (error) {
      console.error('Error in getDeals:',error);
    }
};

export const getUsers = async (accessToken: string, dealId: string) => {
  const url = `${env.TEAMLEADER_API_URL}/users.list`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          ids: [
            `${dealId}`
          ]
        },
      }),
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error("Failed to fetch data from Teamleader");
      }
      const data = (await response.json()) as unknown as User;
      return data;
    } catch (error) {
      console.error('Error in getUsers:',error);
    }
};

export const getCompanies = async (accessToken: string, dealId: string) => {
  const url = `${env.TEAMLEADER_API_URL}/companies.list`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          ids: [
            `${dealId}`
          ]
        },
      }),
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error("Failed to fetch data from Teamleader");
      }
      const data = (await response.json()) as unknown as Company;
      return data;
    } catch (error) {
      console.error('Error in getCompanies:',error);
    }
};

export const simplifyDeals = async (dealsObject: Record<string, any>, accessToken: string): Promise<any[]> => {
  if (!dealsObject || typeof dealsObject !== 'object') {
      console.error('Data, users, or companies is not an object or is null/undefined');
      return [];
  }

  const deals = dealsObject.data; // Assuming deals are nested under 'data' object
  if (!Array.isArray(deals)) {
      console.error('Deals is not an array');
      return [];
  }

  const simplifiedDeals = await Promise.all(deals.map(async deal => {
      const dealId = deal.id;
      const userId = deal.responsible_user.id;
      const companyId = deal.lead?.customer?.id;

      // Find user and company for the deal
      const [userResponse, companyResponse] = await Promise.all([
        getUsers(accessToken, userId),
        companyId ? getCompanies(accessToken, companyId) : null
    ]);

      const user = userResponse?.data?.[0]; 
      const company = companyResponse?.data?.[0];

      if (!user) {
          console.log(`User not found for deal ID: ${dealId}`);
      }

      if (!company) {
          console.log(`Company not found for deal ID: ${dealId}`);
      }

      return {
          id: deal.id,
          title: deal.title,
          estimated_closing_date: deal.estimated_closing_date ?? "",
          company: {
              id: company.id ?? null,
              name: company.name ?? null,
          },
          PM: {
              id: user.id ?? null,
              first_name: user.first_name ?? null,
              last_name: user.last_name ?? null,
              avatar_url: user.avatar_url ?? null,
          },
      };
  }));

  return simplifiedDeals.filter(deal => deal !== null);
}