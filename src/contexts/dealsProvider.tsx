import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useToast } from "~/components/ui/use-toast";
import type { DealPhase, Employee } from "~/lib/types";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";
import { EmployeeContext } from "./employeesProvider";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
  filteredDeals: SimplifiedDeal[] | null | undefined;
  setDealIds: React.Dispatch<React.SetStateAction<string[]>>;
  getDealInfo: (id: string, phaseName: string, employee: Employee) => void;
  isFetched?: boolean;
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
      },
    });
  }
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
        dealPhases,
        isLoading,
        filteredDeals,
        setDealIds,
        getDealInfo,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
