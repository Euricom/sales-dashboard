import React, { createContext, useEffect, useMemo, useState } from "react";
import type { DealPhase, PM } from "~/lib/types";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
  filteredDeals: SimplifiedDeal[] | null | undefined;
  setDealIds: React.Dispatch<React.SetStateAction<string[]>>;
  PMId: string | undefined;
  setPMId: React.Dispatch<React.SetStateAction<string>>;
  getAllPMs: PM[] | undefined | null;
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

  // Filtering deals
  const [dealIds, setDealIds] = useState<string[]>([]);
  const [PMId, setPMId] = useState<string>("");
  const [filteredDeals, setFilteredDeals] = useState<
    SimplifiedDeal[] | undefined | null
  >(deals ?? null);

  useEffect(() => {
    setFilteredDeals(() => {
      if (dealIds.length === 0 && PMId === "") {
        return deals;
      } else {
        return deals?.filter((deal) => {
          if (dealIds.length >= 1 && PMId !== "") {
            return dealIds.includes(deal.id) && deal.PM.id === PMId;
          } else if (dealIds.length >= 1) {
            return dealIds.includes(deal.id);
          } else {
            return deal.PM.id === PMId;
          }
        });
      }
    });
  }, [dealIds, PMId, deals]);

  const getAllPMs = useMemo(() => {
    return deals
      ?.map((deal) => deal.PM)
      .filter(
        (pm, index, self) => index === self.findIndex((t) => t.id === pm.id),
      );
  }, [deals]);

  return (
    <DealContext.Provider
      value={{
        deals,
        dealPhases: dealphases,
        isLoading: isLoading,
        filteredDeals,
        setDealIds,
        PMId,
        setPMId,
        getAllPMs,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
