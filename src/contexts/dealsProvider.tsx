import React, { createContext, useEffect, useMemo, useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import type {
  DealPhase,
  Employee,
  groupedDealFromDB,
  PM,
  GroupedDeal,
  MongoEmployeeDeal,
} from "~/lib/types";
import type {
  SimplifiedDeal,
  SimplifiedDealArray,
} from "~/server/api/routers/teamleader/types";
import { api } from "~/utils/api";
import { dealPhases } from "~/lib/constants";
import type { QueryObserverResult } from "@tanstack/react-query";

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
  filteredDeals: GroupedDeal[] | null | undefined;
  setDealIds: React.Dispatch<React.SetStateAction<string[]>>;
  updateOrCreateDeal: (
    id: string,
    phaseName: string,
    employee: Employee,
  ) => void;
  moveDeal: (id: string, phase_id: string, employee: Employee) => void;
  PMId: string | undefined;
  setPMId: React.Dispatch<React.SetStateAction<string>>;
  getAllPMs: PM[] | undefined | null;
  uniqueDeals: groupedDealFromDB[] | null | undefined;
  filteringCurrentRole: string;
  setFilteringCurrentRole: React.Dispatch<React.SetStateAction<string>>;
  getCorrectDealId: (
    groupedDealid: string,
    employee: Employee,
  ) => string | undefined;
  updateDealProbability: (dealId: string, probability: number) => void;
  refetch: () => Promise<
    QueryObserverResult<
      | { deals: SimplifiedDealArray; uniqueDeals: groupedDealFromDB[] }
      | undefined
    >
  >;
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
  const dealMover = api.teamleader.updateDealPhase.useMutation({
    onSuccess: async () => {
      toast({ title: "success", variant: "success" });
    },
    onError: () => toast({ title: "error", variant: "destructive" }),
  });
  const dealProbabilityMutator =
    api.teamleader.updateDealProbability.useMutation({
      onSuccess: async () => {
        toast({ title: "success", variant: "success" });
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

  // this should refetch the deals every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(
      () => {
        refetch().catch((error) => {
          console.log(error);
        });
      },
      5 * 60 * 1000,
    ); // 5 minutes in milliseconds

    // Clear interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [refetch]);

  function moveDeal(
    groupedDealId: string,
    phaseName: string,
    employee: Employee,
  ) {
    const phase_id = dealPhases.find(
      (phase) => phase.name.toString() === phaseName,
    )?.id;
    if (!phase_id) throw new Error("Phase not found");

    const dealId = getCorrectDealId(groupedDealId, employee);
    if (!dealId) return;
    const input = {
      id: dealId,
      phase_id: phase_id,
    };
    dealMover.mutate(input, {
      onSuccess: () => {
        const updatedDealIds = [...employee.deals];
        const newDeal: MongoEmployeeDeal = {
          dealId: dealId,
          datum: new Date(),
        };

        const filteredDeals: MongoEmployeeDeal[] = updatedDealIds.filter(
          (deal) => {
            return deal.dealId !== dealId;
          },
        );

        filteredDeals.push(newDeal);

        employeeUpdator.mutate({
          employee: {
            employeeId: employee.employeeId,
            rows: employee.rows as string[],
            // replace the old deal with the new one in deals
            deals: filteredDeals,
          },
        });
      },
    });
  }

  function updateOrCreateDeal(
    groupedDealId: string,
    phaseName: string,
    employee: Employee,
  ) {
    const phase_id = dealPhases.find(
      (phase) => phase.name.toString() === phaseName,
    )?.id;
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
      name: employee.fields.Title.split(" ")[0]!,
    };
    dealMutator.mutate(input, {
      onSuccess: (data) => {
        if (
          (data as unknown as MutateDealResponse).data.id !== "shouldNotCreate"
        ) {
          const resolvedData = data as unknown as MutateDealResponse;
          const newId = resolvedData.data.id;
          // update the dealIds in employee
          const updatedDealIds = [...employee.deals];
          const newDeal: MongoEmployeeDeal = {
            dealId: newId,
            datum: new Date(),
          };

          const filteredDeals: MongoEmployeeDeal[] = updatedDealIds.filter(
            (deal) => {
              return deal.dealId !== dealId;
            },
          );

          filteredDeals.push(newDeal);

          employeeUpdator.mutate({
            employee: {
              employeeId: employee.employeeId,
              rows: employee.rows as string[],
              // replace the old deal id with the new one in dealIds
              deals: filteredDeals,
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
        refetch().catch((error) => console.error(error));
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
    if (
      !deals ||
      !uniqueDeals ||
      deals.length === 0 ||
      uniqueDeals.length === 0
    )
      return;

    setInitialDeals(
      deals
        ?.filter((deal, index, self) => {
          return (
            index ===
            self.findIndex(
              (t) =>
                t.title.split("(")[0] === deal.title.split("(")[0] &&
                t.company.name === deal.company.name &&
                (t.estimated_closing_date === deal.estimated_closing_date ||
                  !t.estimated_closing_date) &&
                (t.custom_fields[1]?.value === deal.custom_fields[1]?.value ||
                  !t.custom_fields[1]?.value),
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
    const dealIdsInStorage = localStorage.getItem("dealIds");
    const dealids = dealIdsInStorage
      ? (JSON.parse(dealIdsInStorage) as string[])
      : ([] as string[]);
    const PMID = localStorage.getItem("PMId");
    const ROLe = localStorage.getItem("filteringCurrentRole");

    setDealIds(dealids);
    setPMId(PMID ?? "");
    setFilteringCurrentRole(ROLe ?? "");
  }, [deals, uniqueDeals]);

  useEffect(() => {
    if (!initialDeals) return;

    if (dealIds.length === 0 && PMId === "" && filteringCurrentRole === "") {
      setFilteredDeals(initialDeals); // No need to filter if no criteria are set
      return;
    }

    const filtered = initialDeals.filter((groupedDeal) => {
      const matchesDealIds =
        dealIds.length === 0 || dealIds.includes(groupedDeal.groupedDealId);
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
    if (!employee.deals) return;
    employee.deals.forEach((EmployeeDeal) => {
      // get the deal from the deals array that has the same id as the dealId
      const deal = deals?.find((deal) => deal.id === EmployeeDeal.dealId);
      if (deal) {
        // check if the email of the deal is the same as the email of the employee
        if (
          deal.custom_fields[0]?.value === employee.fields.Euricom_x0020_email
        ) {
          const groupedDeal = uniqueDeals?.find((groupedDeal) =>
            groupedDeal.value.includes(EmployeeDeal.dealId),
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

  // Update probability of the deal
  const updateDealProbability = (dealId: string, probability: number) => {
    dealProbabilityMutator.mutate({ id: dealId, probability: probability });
  };

  return (
    <DealContext.Provider
      value={{
        deals,
        dealPhases,
        isLoading,
        filteredDeals,
        setDealIds,
        updateOrCreateDeal,
        moveDeal,
        PMId,
        setPMId,
        getAllPMs,
        uniqueDeals,
        filteringCurrentRole,
        setFilteringCurrentRole,
        getCorrectDealId,
        updateDealProbability,
        refetch,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
