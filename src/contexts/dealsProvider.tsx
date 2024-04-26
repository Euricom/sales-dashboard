import React, { createContext, useEffect, useMemo, useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import type {
  DealPhase,
  Employee,
  groupedDealFromDB,
  PM,
  GroupedDeal,
} from "~/lib/types";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";
import { dealPhases } from "~/lib/constants";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
  filteredDeals: GroupedDeal[] | null | undefined;
  setDealIds: React.Dispatch<React.SetStateAction<string[]>>;
  getDealInfo: (id: string, phaseName: string, employee: Employee) => void;
  moveDeal: (id: string, phase_id: string, employee: Employee) => void;
  PMId: string | undefined;
  setPMId: React.Dispatch<React.SetStateAction<string>>;
  getAllPMs: PM[] | undefined | null;
  uniqueDeals: groupedDealFromDB[] | null | undefined;
  filteringCurrentRole: string;
  setFilteringCurrentRole: React.Dispatch<React.SetStateAction<string>>;
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
  const { toast } = useToast();

  const dealMutator = api.teamleader.updateDeal.useMutation({
    onSuccess: () => {
      toast({ title: "success", variant: "success" });
    },
    onError: () => toast({ title: "error", variant: "destructive" }),
  });
  const dealMover = api.teamleader.updateDealPhase.useMutation({
    onSuccess: async () => {
      toast({ title: "success", variant: "success" });
      // await refetch();
    },
    onError: () => toast({ title: "error", variant: "destructive" }),
  });
  const employeeUpdator = api.mongodb.updateEmployee.useMutation();

  const deals = useMemo(
    () => (!isLoading ? dealsData?.deals : null),
    [dealsData, isLoading],
  );
  const uniqueDeals = useMemo(
    () => (!isLoading ? dealsData?.uniqueDeals : null),
    [dealsData, isLoading],
  );

  const mongoDealUpdator = api.mongodb.updateDeal.useMutation();

  type MutateDealResponse = {
    data: {
      id: string;
      type: string;
    };
  };

  function moveDeal(
    groupedDealId: string,
    phaseName: string,
    employee: Employee,
  ) {
    const phase_id = dealPhases.find((phase) => phase.name === phaseName)?.id;
    if (!phase_id) throw new Error("Phase not found");

    const dealId = getCorrectDealId(groupedDealId, employee);
    if (!dealId) return;
    const input = {
      id: dealId,
      phase_id: phase_id,
    };
    dealMover.mutate(input);
  }

  function getDealInfo(
    groupedDealId: string,
    phaseName: string,
    employee: Employee,
  ) {
    const phase_id = dealPhases.find((phase) => phase.name === phaseName)?.id;
    if (!phase_id || !employee.fields.Euricom_x0020_email) {
      throw new Error("Phase not found");
    }
    const dealId = uniqueDeals?.find(
      (groupedDeal) => groupedDeal.id === groupedDealId,
    )?.value[0];
    if (!dealId) return;
    const input = {
      id: dealId,
      email: employee.fields.Euricom_x0020_email,
      phase_id: phase_id,
    };
    dealMutator.mutate(input, {
      onSuccess: (data) => {
        if (
          (data as unknown as MutateDealResponse).data.id !== "shouldNotCreate"
        ) {
          const resolvedData = data as unknown as MutateDealResponse;
          const newId = resolvedData.data.id;
          // update the dealIds in employee
          const updatedDealIds = [...employee.dealIds];
          let newDealIds: string[] = [dealId];

          updatedDealIds.push(newId);
          newDealIds = updatedDealIds.filter((id) => {
            return id !== dealId;
          });

          employeeUpdator.mutate({
            employee: {
              employeeId: employee.employeeId,
              rows: employee.rows as string[],
              // replace the old deal id with the new one in dealIds
              dealIds: newDealIds,
            },
          });
          const groupedDeal = uniqueDeals.find(
            (deal) => deal.id === groupedDealId,
          )!;
          if (!groupedDeal.value.includes(newId))
            groupedDeal?.value.push(newId);
          mongoDealUpdator.mutate({
            id: groupedDealId,
            value: groupedDeal.value,
          });
        }
      },
    });
  }

  // Filtering deals
  const [initialDeals, setInitialDeals] = useState<
    GroupedDeal[] | undefined | null
  >(null);
  const [dealIds, setDealIds] = useState<string[]>([]);
  const [PMId, setPMId] = useState<string>("");
  const [filteringCurrentRole, setFilteringCurrentRole] = useState<string>("");
  const [filteredDeals, setFilteredDeals] = useState<
    GroupedDeal[] | undefined | null
  >(null);

  useEffect(() => {
    if (uniqueDeals?.length === 0) return;
    setInitialDeals(
      deals
        ?.filter((deal, index, self) => {
          return (
            index ===
            self.findIndex(
              (t) => (
                t.title === deal.title,
                t.company.name === deal.company.name,
                t.estimated_closing_date === deal.estimated_closing_date,
                t.custom_fields[1]?.value === deal.custom_fields[1]?.value
              ),
            )
          );
        })
        .map((deal) => {
          const groupedDealId = uniqueDeals?.find((entry) =>
            entry.value.includes(deal.id),
          )?.id;
          return {
            deal: deal,
            groupedDealId: groupedDealId ?? "",
          };
        }),
    );
  }, [deals, uniqueDeals]);

  useEffect(() => {
    if (!initialDeals) return;

    if (dealIds.length === 0 && PMId === "" && filteringCurrentRole === "") {
      setFilteredDeals(initialDeals); // No need to filter if no criteria are set
      return;
    }

    const filtered = initialDeals.filter((groupedDeal) => {
      const matchesDealIds =
        dealIds.length === 0 || dealIds.includes(groupedDeal.deal.id);
      const matchesPMId = PMId === "" || groupedDeal.deal.PM.id === PMId;
      const matchesCurrentRole =
        filteringCurrentRole === "" ||
        groupedDeal.deal.custom_fields[1]?.value === filteringCurrentRole;

      return matchesDealIds && matchesPMId && matchesCurrentRole;
    });

    setFilteredDeals(filtered);
  }, [dealIds, PMId, filteringCurrentRole, initialDeals]);

  const getAllPMs = useMemo(() => {
    if (deals)
      return deals
        ?.map((deal) => deal.PM)
        .filter(
          (pm, index, self) => index === self.findIndex((t) => t.id === pm.id),
        );
  }, [deals]);

  const getCorrectDealId = (groupedDealid: string, employee: Employee) => {
    let correctDealId = "";
    employee.dealIds.forEach((dealId) => {
      // get the deal from the deals array that has the same id as the dealId
      const deal = deals?.find((deal) => deal.id === dealId);
      if (deal) {
        // check if the email of the deal is the same as the email of the employee
        if (
          deal.custom_fields[0]?.value === employee.fields.Euricom_x0020_email
        ) {
          const groupedDeal = uniqueDeals?.find((groupedDeal) =>
            groupedDeal.value.includes(dealId),
          );
          // check if the groupedDealId of the deal is the same as the groupedDealId you want to move
          if (groupedDeal?.id === groupedDealid) {
            correctDealId = deal.id;
          }
        }
      }
    });
    return correctDealId;
  };

  return (
    <DealContext.Provider
      value={{
        deals,
        dealPhases,
        isLoading,
        filteredDeals,
        setDealIds,
        getDealInfo,
        moveDeal,
        PMId,
        setPMId,
        getAllPMs,
        uniqueDeals,
        filteringCurrentRole,
        setFilteringCurrentRole,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
