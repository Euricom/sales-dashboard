import React, { createContext, useEffect, useMemo, useState } from "react";
import type { DealPhase } from "~/lib/types";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
  filteredDeals: SimplifiedDeal[] | null | undefined;
  setDealIds: React.Dispatch<React.SetStateAction<string[]>>;
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

  const [dealIds, setDealIds] = useState<string[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<
    SimplifiedDeal[] | undefined | null
  >(deals ?? null);

  useEffect(() => {
    console.log(dealIds);
    if (dealIds.length === 0) {
      setFilteredDeals(deals);
    } else {
      setFilteredDeals(deals?.filter((deal) => dealIds.includes(deal.id)));
    }
  }, [dealIds, deals]);

  return (
    <DealContext.Provider
      value={{
        deals,
        dealPhases: dealphases,
        isLoading: isLoading,
        filteredDeals,
        setDealIds,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
