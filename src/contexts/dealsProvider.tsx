import React, { createContext, useMemo } from "react";
import type { DealPhase } from "~/lib/types";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
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

  const dealphases = [
    {
      name: "Mogelijkheden",
    },
    {
      name: "Voorgesteld",
    },
    {
      name: "Interview",
    },
    {
      name: "Weerhouden",
    },
    {
      name: "Niet-Weerhouden",
    },
  ];

  return (
    <DealContext.Provider
      value={{
        deals,
        dealPhases: dealphases,
        isLoading: isLoading,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
