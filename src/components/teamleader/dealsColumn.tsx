import DealCard from "./dealCard";
import { CardContent } from "../ui/card";
import { useContext } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import { type GroupedDeal } from "~/lib/types";

export default function DealsColumn() {
  const { filteredDeals } = useContext(DealContext);

  return (
    <div>
      <CardContent className="column p-1 flex flex-col gap-2 no-scrollbar overflow-auto h-[calc(100vh-9.625rem)] w-[22.5rem]">
        {filteredDeals?.map((dealObject: GroupedDeal, index) => (
          <DealCard groupedDeal={dealObject} key={index} />
        ))}
      </CardContent>
    </div>
  );
}
