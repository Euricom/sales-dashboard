import type { groupedDealFromDB } from "~/lib/types";
import type {
  Company,
  Deal,
  Phase,
  SimplifiedDealArray,
  User,
  dataObject,
  EditDealFieldsResult,
  SimplifiedDeal,
} from "./types";
import { getCompanyLogo, getDeal } from "./utils";
import { checkWhichDealsNeedToBeCreatedOrUpdated } from "../mongodb/mongoDealsClient";

export const simplifyDeals = async (
  dealsObject: dataObject,
  accessToken: string,
): Promise<SimplifiedDealArray> => {
  if (!dealsObject || typeof dealsObject !== "object") {
    console.error(
      "Data, users, or companies is not an object or is null/undefined",
    );
    return [];
  }
  // put deals, users, and companies in variables
  const deals = dealsObject.data;
  const users = dealsObject.included.user;
  const companies = dealsObject.included.company;
  const phases = dealsObject.included.dealPhase;

  if (
    !Array.isArray(deals) ||
    !Array.isArray(users) ||
    !Array.isArray(companies)
  ) {
    console.error("deals, users or companies is not an array");
    return [];
  }

  const simplifiedDeals = await Promise.all(
    deals.map(async (deal: Deal) => {
      const dealId: string = deal.id;
      const userId: string = deal.responsible_user.id;
      const companyId: string = deal.lead?.customer?.id;
      const phaseId: string = deal.current_phase.id;
      // find the user and company that are responsible for the deal
      const user = users.find((user: User) => user.id === userId);
      const company = companies.find(
        (company: Company) => company.id === companyId,
      );
      const phase = phases.find((phase: Phase) => phase.id === phaseId);

      const dealInfo = await getDeal(accessToken, dealId);

      if (!user) {
        console.log(`User not found for deal ID: ${dealId}`);
      }
      if (!company) {
        console.log(`Company not found for deal ID: ${dealId}`);
      }
      if (!phase) {
        console.log(`Phase not found for deal ID: ${dealId}`);
      }
      if (!dealInfo) {
        console.log(`Deal not found for deal ID: ${dealId}`);
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
        custom_fields: dealInfo?.data.custom_fields.map((field) => ({
          definition: {
            type: field.definition.type,
            id: field.definition.id,
          },
          value: field.value,
        })),
      };
    }),
  );

  // remove null values and sort the deals by estimated_closing_date
  const sortedDeals = simplifiedDeals
    .filter((deal) => deal !== null)
    .sort((a, b) => {
      if (!a.estimated_closing_date) return 1; // a is put last
      if (!b.estimated_closing_date) return -1; // b is put last
      return (
        new Date(a.estimated_closing_date).getTime() -
        new Date(b.estimated_closing_date).getTime()
      );
    }) as SimplifiedDealArray;

  return sortedDeals;
};

export const editDealFields = async (
  accessToken: string,
  dealId: string,
  phaseId: string,
  email: string,
  name: string,
): Promise<EditDealFieldsResult | null> => {
  let shouldCreate = false;
  const deal = await getDeal(accessToken, dealId);
  if (!deal) return null;

  const emailFieldId = deal.included.customFieldDefinition.find(
    (field) => field.label === "E-mail consultant",
  )?.id;

  if (deal.data.custom_fields) {
    deal.data.custom_fields.forEach((field) => {
      if (field.definition.id === emailFieldId) {
        if (field.value !== null && field.value !== email) {
          shouldCreate = true;
        }
        field.value = email;
      }
    });
    deal.data.current_phase.id = phaseId;
  }
  if(deal.data.title) {
    deal.data.title = deal.data.title + " (" + name + ")";
  }
  return { deal, shouldCreate };
};

export const makeUniqueDeals = async (deals: SimplifiedDealArray) => {
  const UniqueDeals = [] as groupedDealFromDB[];
  // Group deals by unique key
  deals.forEach((deal) => {
    const key = generateKey(deal);
    if (!key) return;
    const existingDeal = UniqueDeals.find((entry) => entry.id === key);

    if (existingDeal) {
      // If a deal with the same key exists, push the deal ID to its value array
      existingDeal.value.push(deal.id);
    } else {
      // If no deal with the same key exists, create a new entry
      UniqueDeals.push({ id: key, value: [deal.id] });
    }
  });

  // call the check in mongoDB router
  await checkWhichDealsNeedToBeCreatedOrUpdated(UniqueDeals);

  return UniqueDeals;
};

const generateKey = (deal: SimplifiedDeal | undefined | null) => {
  if (!deal) return;
  const title = deal.title.split("(")[0];
  const string = `${title}, ${deal.company.name}, ${deal.estimated_closing_date}, ${deal.custom_fields[1]?.value}`;

  return btoa(string);
};
