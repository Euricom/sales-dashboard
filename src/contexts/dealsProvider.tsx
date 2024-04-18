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
  getDealInfo: (id: string, email: string, phaseName: string) => void;
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
  const dealMutator = api.teamleader.updateDeal.useMutation();

  const deals = useMemo(
    () => (isLoading ? null : dealsData),
    [dealsData, isLoading],
  );

  const dealphases = [
    {
      id: "7c711ed5-1d69-012b-a341-4c1ed1f057cb",
      name: "Mogelijkheden",
    },
    {
      id: "1825bd2c-03bf-097c-8549-686bf8f96f4c",
      name: "Voorgesteld",
    },
    {
      id: "8125dec5-a0ed-0775-a643-774979b85e23",
      name: "Interview",
    },
    {
      id: "364b6867-54b9-0694-aa41-cf2ad6617028",
      name: "Weerhouden",
    },
    {
      id: "a1f0931d-2094-0c3a-9342-98df836a57ce", // dit moet nog nagevraagd worden bij de PM's
      name: "Niet-Weerhouden",
    },
  ];

  function getDealInfo(id: string, email: string, phaseName: string) {
    const phase_id = dealphases.find((phase) => phase.name === phaseName)?.id;
    if (!phase_id) {
      throw new Error("Phase not found");
    }
    const input = {
      id: id,
      email: email,
      phase_id: phase_id,
    };
    dealMutator.mutate(input);
  }
  // const [currentDeal, setCurrentDeal] = useState();
  // const dealInfo = useMemo(() => {
  //   const phase_id = dealphases.find(
  //     (phase) => phase.name === currentDeal.phaseName,
  //   )?.id;
  // }, [currentDeal]);
  const [dealIds, setDealIds] = useState<string[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<
    SimplifiedDeal[] | undefined | null
  >(deals ?? null);

  useEffect(() => {
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
        getDealInfo,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
