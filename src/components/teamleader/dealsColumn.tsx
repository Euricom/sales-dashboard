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
    <>
      <CardContent className="flex flex-col gap-2 ">
        {filteredDeals?.map((dealObject: SimplifiedDeal, index) => (
          <DealCard deal={dealObject} key={index} />
        ))}
      </CardContent>
    </>
  );
}
