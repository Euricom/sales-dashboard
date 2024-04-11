import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";
import { CardContent } from "../ui/card";
import { useContext } from "react";
import { DealContext } from "~/contexts/dealsProvider";

export default function DealsColumn() {
  const { filteredDeals } = useContext(DealContext);

  if (!filteredDeals) {
    return <div>is loading...</div>;
  }
  return (
    <div>
      <CardContent className="column flex flex-col gap-2 no-scrollbar overflow-auto h-[calc(100vh-9.625rem)]">
        {filteredDeals?.map((dealObject: SimplifiedDeal, index) => (
          <DealCard deal={dealObject} key={index} />
        ))}
      </CardContent>
    </div>
  );
}
