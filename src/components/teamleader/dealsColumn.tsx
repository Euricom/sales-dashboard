import DealCard from "./dealCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useContext } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import { type GroupedDeal } from "~/lib/types";
import { X } from "lucide-react";
import { FilterMenu } from "../ui/filterMenu";

export default function DealsColumn() {
  const { filteringCurrentRole, setFilteringCurrentRole, filteredDeals, isLoading, PMId, setPMId, getAllPMs } = useContext(DealContext);

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
    if (PMId) {
      const pmName = getAllPMs?.find((pm) => pm.id === PMId)?.first_name;

      return (
        <div className="text-sm flex flex-row gap-1 items-center bg-primary text-white rounded-14 pl-1 pr-0.5">
          <div>{pmName}</div>
          <div className="rounded-full bg-white text-black">
            <X
              size={16}
              onClick={() => {
                localStorage.setItem("PMId", "");
                setPMId("");
              }}
            />
          </div>
        </div>
      );
    }
  };

  const handleRolePill = () => {
    if (filteringCurrentRole !== "" && filteringCurrentRole !== undefined) {
      return (
        <div className="text-sm flex flex-row gap-1 items-center bg-primary text-white rounded-14 pl-1.5 pr-0.5">
          <div>{filteringCurrentRole}</div>
          <div className="rounded-full bg-white text-black">
            <X
              size={16}
              onClick={() => {
                localStorage.setItem("filteringCurrentRole", "");
                setFilteringCurrentRole("");
              }}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <Card
    variant="columnDeals"
    size="columnDeals"
  >
      <CardHeader>
        <CardTitle className="pb-1.5 truncate flex justify-between w-full">
          Deals
            <div className="flex flex-row gap-1">
              {handlePMPill()}
              {handleRolePill()}
              <FilterMenu />
            </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="column p-1 flex flex-col gap-2 no-scrollbar overflow-auto h-[calc(100vh-9.625rem)] min-w-[24rem]">
        {filteredDeals?.map((dealObject: GroupedDeal, index) => (
          <DealCard groupedDeal={dealObject} key={index} />
        ))}
      </CardContent>
    </Card>
  );
}
