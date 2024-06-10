import DealCard from "./dealCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useContext } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import { type GroupedDeal } from "~/lib/types";
import { X } from "lucide-react";
import { FilterMenu } from "../ui/filterMenu";
import { SortMenu } from "../ui/sortMenu";

export default function DealsColumn() {
  const {
    filterRole,
    removeRoleFilter,
    filteredDeals,
    isLoading,
    filterPm,
    removePmFilter,
    getAllPMs,
  } = useContext(DealContext);

  if (isLoading) {
    return (
      <div className="basis-[24.5rem] bg-secondary rounded-14 animate-pulse px-4 py-2">
        <div className="pb-1.5 text-white">Deals</div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-[3.75rem] bg-primary rounded-14 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const handlePMPill = () => {
    if (!filterPm.length) return null;

    return filterPm.map(pmId => {
      const pmName = getAllPMs?.find((pm) => pm.id === pmId)?.first_name;
      return (
      <div className="text-sm flex flex-row gap-1 items-center bg-primary text-white rounded-14 pl-1.5 pr-1" key={pmId}>
            <div>{pmName}</div>
            <div className="rounded-full bg-white text-black">
              <X
                size={16}
                onClick={() => {removePmFilter(pmId)}}
              />
            </div>
          </div>
      );
    });
  };

  const handleRolePill = () => {
    if (!filterRole.length) return null;

    return filterRole.map(role => {
      return (
        <div className="text-sm flex flex-row gap-1 items-center bg-primary text-white rounded-14 pl-1.5 pr-0.5" key={role}>
          <div>{role}</div>
          <div className="rounded-full bg-white text-black">
            <X
              size={16}
              onClick={() => {
                removeRoleFilter(role);
              }}
            />
          </div>
        </div>
      );
    })
  };

  return (
    <Card variant="columnDeals" size="columnDeals">
      <CardHeader>
        <CardTitle className="pb-1.5 truncate flex justify-between w-full">
          <div className="flex gap-1.5 mr-2">
            <div>Deals</div>
            <div className="bg-white/30 rounded-14 h-1/2 w-0.5 flex self-center" />
            {filteredDeals?.length}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-row max-w-72 overflow-hidden justify-end">
              <div className="flex gap-1 no-scrollbar overflow-x-auto">
                {handlePMPill()}
                {handleRolePill()}
              </div>
            </div>
            <FilterMenu />
            <SortMenu />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="column p-1 flex flex-col gap-2 no-scrollbar overflow-auto h-[calc(100vh-9.625rem)]">
        {filteredDeals?.map((dealObject: GroupedDeal, index) => (
          <DealCard groupedDeal={dealObject} key={index} />
        ))}
      </CardContent>
    </Card>
  );
}
