import React, { createContext, useEffect, useMemo, useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import type { DealPhase, Employee } from "~/lib/types";
import type { DealPhase, PM } from "~/lib/types";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
  filteredDeals: SimplifiedDeal[] | null | undefined;
  setDealIds: React.Dispatch<React.SetStateAction<string[]>>;
  getDealInfo: (id: string, phaseName: string, employee: Employee) => void;
  isRefetching?: boolean;
  setIsRefetching: React.Dispatch<React.SetStateAction<boolean>>;
  moveDeal: (id: string, phase_id: string) => void;
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
  const {
    data: dealsData,
    isLoading,
    refetch,
  } = api.teamleader.getDealsData.useQuery();
  const { toast } = useToast();

  const dealMutator = api.teamleader.updateDeal.useMutation({
    onSuccess: () => {
      toast({ title: "success", variant: "success" });
    },
    onError: () => toast({ title: "error", variant: "destructive" }),
  });
  const dealMover = api.teamleader.moveDeal.useMutation({
    onSuccess: async () => {
      toast({ title: "success", variant: "success" });
      await refetch();
    },
    onError: () => toast({ title: "error", variant: "destructive" }),
  });
  const employeeUpdator = api.mongodb.updateEmployee.useMutation();
  const deals = useMemo(
    () => (isLoading ? null : dealsData),
    [dealsData, isLoading],
  );
  const [isRefetching, setIsRefetching] = useState(false);

  const dealPhases = [
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

  type MutateDealResponse = {
    data: {
      id: string;
      type: string;
    };
  };

  function moveDeal(id: string, phaseName: string) {
    const phase_id = dealPhases.find((phase) => phase.name === phaseName)?.id;
    if (!phase_id) throw new Error("Phase not found");
    const input = {
      id: id,
      phase_id: phase_id,
    };
    dealMover.mutate(input);
  }

  function getDealInfo(id: string, phaseName: string, employee: Employee) {
    const phase_id = dealPhases.find((phase) => phase.name === phaseName)?.id;
    if (!phase_id || !employee.fields.Euricom_x0020_email) {
      throw new Error("Phase not found");
    }
    const input = {
      id: id,
      email: employee.fields.Euricom_x0020_email,
      phase_id: phase_id,
    };
    dealMutator.mutate(input, {
      onSuccess: (data) => {
        const resolvedData = data as unknown as MutateDealResponse;
        const newId = resolvedData.data.id;
        if (newId === "shouldNotCreate") return;
        const rowToEdit = employee.rows.find(
          (row) => (row as string).split("/")[0] === id,
        );
        const newRow = `${newId}/${(rowToEdit as string)?.split("/")[1]}`;
        employeeUpdator.mutate({
          employee: {
            employeeId: employee.employeeId,
            rows: employee.rows.map((row) =>
              (row as string).split("/")[0] === id ? newRow : row,
            ) as string[],
          },
        });
        refetch()
          .then(() => {
            setIsRefetching(true);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      },
    });
  }
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
        dealPhases,
        isLoading,
        filteredDeals,
        isRefetching,
        setIsRefetching,
        setDealIds,
        getDealInfo,
        moveDeal,
        PMId,
        setPMId,
        getAllPMs,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
