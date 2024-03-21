import React, { createContext, useMemo } from "react";
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
  const { data: dealsData, isLoading } = api.teamleader.getDealsData.useQuery();

  const deals = useMemo(
    () => (isLoading ? null : dealsData),
    [dealsData, isLoading],
  );

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
