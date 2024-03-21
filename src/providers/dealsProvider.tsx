import React, { createContext, useState, useEffect, useMemo } from "react";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
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
  const { data, isLoading } = api.teamleader.getDealsData.useQuery();

  const deals = useMemo(() => (isLoading ? null : data), [data, isLoading]);

  console.log("Deals:", deals);
  // const deals = useMemo(() => {
  //   return api.teamleader.getDealsData.useQuery() ?? [];
  // }, []);

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
