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
import { SortKey } from "~/components/ui/sortMenu";

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
  deleteDeal: (id: string, employee: Employee) => void;
  filterPm: string[];
  addDealFilter: (dealId: string[]) => void,
  clearDealFilter: () => void,
  addPmFilter: (pm: string) => void,
  removePmFilter: (pm: string) => void,
  clearPmFilter: () => void,
  getAllPMs: PM[] | undefined | null;
  uniqueDeals: groupedDealFromDB[] | null | undefined;
  filterRole: string[];
  addRoleFilter: (role: string) => void,
  removeRoleFilter: (role: string) => void,
  clearRoleFilter: () => void,
  sortDeals: SortKey,
  addSortDeals: (sort: SortKey) => void,
  clearSortDeals: (sort: SortKey) => void,
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
  currentDealDetailsId: string;
  setCurrentDealDetailsId: React.Dispatch<React.SetStateAction<string>>;
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
  const {
    refetch: employeeRefetch,
  } = api.mongodb.getEmployees.useQuery();
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
  const dealProbabilityMutator = api.teamleader.updateDealProbability.useMutation({
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

  const dealDeleter = api.teamleader.deleteDeal.useMutation({
    onSuccess: async () => {
      toast({ title: "success", variant: "success" });
    },
    onError: () => toast({ title: "error", variant: "destructive" }),
  });

  const mongoDealUpdator = api.mongodb.updateDeal.useMutation();

  type MutateDealResponse = {
    data: {
      id: string;
      type: string;
    };
  };

  const [currentDealDetailsId, setCurrentDealDetailsId] = useState<string>("");

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
          date: new Date(),
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
            date: new Date(),
          };

          const filteredDeals: MongoEmployeeDeal[] = updatedDealIds.filter((deal) =>  deal.dealId !== dealId);

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

  function deleteDeal(groupedDealId: string, employee: Employee) {
    if (!groupedDealId) return;
    const dealId = uniqueDeals?.find(
      (groupedDeal) => groupedDeal.id === groupedDealId,
    )?.value[0];
    if (!dealId) return;
    dealDeleter.mutate({id: dealId}, {
      onSuccess: (data) => {
        if(!data) return;
        const updatedDealIds = [...employee.deals];
        const filteredRows = employee.rows.filter(row => row.toString().split("/")[0] !== groupedDealId);
        const filteredDeals: MongoEmployeeDeal[] = updatedDealIds.filter((deal) => deal.dealId !== dealId);

        employeeUpdator.mutate({
          employee: {
            employeeId: employee.employeeId,
            rows: filteredRows as string[],
            deals: filteredDeals,
          },
        });

        employeeRefetch().catch((error) => console.error(error));

        const groupedDeal = uniqueDeals.find((deal) => deal.id === groupedDealId)!;
        const filteredGroupedDeal = groupedDeal.value.filter(dealId => dealId !== dealId);

        mongoDealUpdator.mutate({
          id: groupedDealId,
          value: filteredGroupedDeal,
        });

        refetch().catch((error) => console.error(error));
      }
    });
  }

  // Filtering deals
  const [initialDeals, setInitialDeals] = useState<
    GroupedDeal[] | undefined | null
  >(null);
  const [dealIds, setDealIds] = useState<string[]>([]);
  const [filterPm, setFilterPm] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<string[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<
    GroupedDeal[] | undefined | null
  >(null);

  // Sorting deals
  const [sortDeals, setSortDeals] = useState<SortKey>(SortKey.DateASC);

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
    const dealids = dealIdsInStorage ? (JSON.parse(dealIdsInStorage) as string[]): [];

    const pmIdsInStorage = localStorage.getItem("filterPm");
    const pmIds = pmIdsInStorage ? JSON.parse(pmIdsInStorage) as string[] : [];

    const rolesInStorage = localStorage.getItem("filterRoles");
    const roleIds =  rolesInStorage ? JSON.parse(rolesInStorage) as string[] : [] ;

    const sortInStorage = localStorage.getItem("sortDeals");
    const sort =  sortInStorage ? sortInStorage as SortKey : SortKey.DateASC ;

    setDealIds(dealids);
    setFilterPm(pmIds);
    setFilterRole(roleIds);
    setSortDeals(sort);
  }, [deals, uniqueDeals]);

  useEffect(() => {
    if (!initialDeals) return;
    if (dealIds.length === 0 && !filterPm.length && !filterRole.length && !sortDeals) {
      setFilteredDeals(initialDeals); // No need to filter if no criteria are set
      return;
    }

    const filtered = initialDeals.filter((groupedDeal) => {
      const matchesDealIds =
        dealIds.length === 0 || dealIds.includes(groupedDeal.groupedDealId);
      const matchesPMId = !filterPm.length || filterPm.includes(groupedDeal.deal.PM.id);
      const matchesCurrentRole =
        !filterRole.length ||
        filterRole.some(s => s.includes(groupedDeal.deal.custom_fields[1]!.value!));

      return matchesDealIds && matchesPMId && matchesCurrentRole;
    });


    const sorted = [...filtered].sort((a, b) => {
      switch (sortDeals) {
        case SortKey.AlphASC:
          return a.deal.company.name.localeCompare(b.deal.company.name);
        case SortKey.AlphDESC:
          return b.deal.company.name.localeCompare(a.deal.company.name);
        case SortKey.DateDESC: 
          return (
            new Date(a.deal.created_at).getTime() -
            new Date(b.deal.created_at).getTime()
          );
        default:
          return 1;
      }
    })

    setFilteredDeals(sorted);
  }, [dealIds, filterPm, filterRole, initialDeals, sortDeals]);

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

  const addDealFilter = (dealIds: string[]) => {
    localStorage.setItem("dealIds", JSON.stringify(dealIds));
    setDealIds(dealIds);
  }

  const clearDealFilter = () => {
    localStorage.setItem("dealIds", JSON.stringify([]));
    setDealIds([]);
  }

  const addRoleFilter = (role: string) => {
    localStorage.setItem("filterRoles", JSON.stringify([...filterRole, role]));
    setFilterRole(a => [...a, role]);
  }

  const removeRoleFilter = (role: string) => {
    localStorage.setItem("filterRoles", JSON.stringify(filterRole.filter(r => r !== role)));
    setFilterRole(filterRole.filter(a => a !== role));
  }

  const clearRoleFilter = () => {
    localStorage.setItem("filterRoles", JSON.stringify([]));
    setFilterRole([]);
  }

  const addPmFilter = (pm: string) => {
    localStorage.setItem("filterPm", JSON.stringify([...filterPm, pm]));
    setFilterPm(a => [...a, pm]);
  }

  const removePmFilter = (pm: string) => {
    localStorage.setItem("filterPm", JSON.stringify(filterPm.filter(a => a !== pm)));
    setFilterPm(filterPm.filter(a => a !== pm));
  }

  const clearPmFilter = () => {
    localStorage.setItem("filterPm", JSON.stringify([]));
    setFilterPm([]);
  }

  const addSortDeals = (sort: SortKey) => {
    localStorage.setItem("sortDeals", sort);
    setSortDeals(sort);
  }

  const clearSortDeals = () => {
    localStorage.setItem("sortDeals", SortKey.DateASC);
    setSortDeals(SortKey.DateASC);
  }

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
        deleteDeal,
        filterPm,
        addDealFilter,
        clearDealFilter,
        addPmFilter,
        removePmFilter,
        clearPmFilter,
        getAllPMs,
        uniqueDeals,
        filterRole,
        addRoleFilter,
        removeRoleFilter,
        clearRoleFilter,
        sortDeals,
        addSortDeals,
        clearSortDeals,
        getCorrectDealId,
        updateDealProbability,
        refetch,
        currentDealDetailsId,
        setCurrentDealDetailsId,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};
