import React, { createContext, useState, useEffect } from "react";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { getTeamleaderData } from "~/components/teamleader/utils";

type DealContextType = {
  deals: SimplifiedDeal[] | null; // Allow for null value to indicate loading state
};

export const DealContext = createContext<DealContextType>(
  {} as DealContextType,
);

type DealContextProviderProps = {
  children: React.ReactNode;
};

export const DealContextProvider: React.FC<DealContextProviderProps> = ({
  children,
}) => {
  const [deals, setDeals] = useState<SimplifiedDeal[] | null>(
    getTeamleaderData()?.data ?? null,
  ); // Initialize as null

  console.log(deals, "deals");

  if (deals === null) return <div>Loading...</div>; // Handle loading state

  return (
    <DealContext.Provider
      value={{
        deals,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
