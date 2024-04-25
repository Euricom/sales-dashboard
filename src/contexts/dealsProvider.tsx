import { cp } from "fs";
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

type DealContextType = {
  deals: SimplifiedDeal[] | null | undefined; // Allow for null value to indicate loading state
  dealPhases: DealPhase[];
  isLoading?: boolean;
  filteredDeals: GroupedDeal[] | null | undefined;
  setDealIds: React.Dispatch<React.SetStateAction<string[]>>;
  getDealInfo: (id: string, phaseName: string, employee: Employee) => void;
  isRefetching?: boolean;
  setIsRefetching: React.Dispatch<React.SetStateAction<boolean>>;
  moveDeal: (id: string, phase_id: string, employee: Employee) => void;
  PMId: string | undefined;
  setPMId: React.Dispatch<React.SetStateAction<string>>;
  getAllPMs: PM[] | undefined | null;
  uniqueDeals: groupedDealFromDB[];
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
  const [uniqueDeals, setUniqueDeals] = useState<groupedDealFromDB[]>([]);
  const mongoDealMutator = api.mongodb.updateDeals.useMutation();
  const mongoDealUpdator = api.mongodb.updateDeal.useMutation();

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
      id: "7ec460c1-416a-03ce-8460-0299ae10bb38",
      name: "Niet-Weerhouden",
    },
  ];

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

    // this still needs to be changed
    const dealId = getCorrectDealId(groupedDealId, employee);

    const input = {
      id: dealId,
      phase_id: phase_id,
    };
    dealMover.mutate(input, {
      onSuccess: () => {
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

  function getDealInfo(
    groupedDealId: string,
    phaseName: string,
    employee: Employee,
  ) {
    const phase_id = dealPhases.find((phase) => phase.name === phaseName)?.id;
    if (!phase_id || !employee.fields.Euricom_x0020_email) {
      throw new Error("Phase not found");
    }
    const dealId = uniqueDeals.find(
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
          (data as unknown as MutateDealResponse).data.id === "shouldNotCreate"
        ) {
          const updatedDealIds = employee.dealIds;
          updatedDealIds.push(dealId);
          employeeUpdator.mutate({
            employee: {
              employeeId: employee.employeeId,
              rows: employee.rows as string[],
              // replace the old deal id with the new one in dealIds
              dealIds: updatedDealIds,
            },
          });
        } else {
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

  useEffect(() => {
    if (deals) {
      const newUniqueDeals = [] as groupedDealFromDB[];
      // Group deals by unique key
      deals.forEach((deal) => {
        const key = generateKey(deal);
        if (!key) return;
        const existingDeal = newUniqueDeals.find((entry) => entry.id === key);

        if (existingDeal) {
          // If a deal with the same key exists, push the deal ID to its value array
          existingDeal.value.push(deal.id);
        } else {
          // If no deal with the same key exists, create a new entry
          newUniqueDeals.push({ id: key, value: [deal.id] });
        }
      });
      setUniqueDeals(newUniqueDeals);
    }
  }, [deals]);

  useEffect(() => {
    // Call the mutator function
    mongoDealMutator.mutate(uniqueDeals);
  }, [uniqueDeals]);

  // Filtering deals
  const [dealIds, setDealIds] = useState<string[]>([]);
  const [PMId, setPMId] = useState<string>("");
  const [filteredDeals, setFilteredDeals] = useState<
    GroupedDeal[] | undefined | null
  >(null);

  useEffect(() => {
    if (uniqueDeals.length === 0) return;
    setFilteredDeals(
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
          const groupedDealId = uniqueDeals.find((entry) =>
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
    setFilteredDeals(() => {
      if (dealIds.length === 0 && PMId === "") {
        return filteredDeals;
      } else {
        return filteredDeals?.filter((groupedDeal) => {
          if (dealIds.length >= 1 && PMId !== "") {
            return (
              dealIds.includes(groupedDeal.deal.id) &&
              groupedDeal.deal.PM.id === PMId
            );
          } else if (dealIds.length >= 1) {
            return dealIds.includes(groupedDeal.deal.id);
          } else {
            return groupedDeal.deal.PM.id === PMId;
          }
        });
      }
    });
  }, [dealIds, PMId, filteredDeals]);

  const getAllPMs = useMemo(() => {
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
          const groupedDeal = uniqueDeals.find((groupedDeal) =>
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
        isRefetching,
        setIsRefetching,
        setDealIds,
        getDealInfo,
        moveDeal,
        PMId,
        setPMId,
        getAllPMs,
        uniqueDeals,
      }}
    >
      {children}
    </DealContext.Provider>
  );
};

function generateKey(deal: SimplifiedDeal | undefined | null) {
  if (!deal) return;
  const string = `${deal.title}, ${deal.company.name}, ${deal.estimated_closing_date}, ${deal.custom_fields[1]?.value}`;

  return btoa(string);
}
