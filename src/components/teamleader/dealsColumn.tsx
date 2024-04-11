import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";
import { CardContent } from "../ui/card";
import { useContext } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import { Trash } from "lucide-react";
import { DropContext } from "~/contexts/dndProvider";

export default function DealsColumn({ isDeals }: { isDeals: boolean }) {
  const { filteredDeals } = useContext(DealContext);
  const { isDeletable } = useContext(DropContext);

  if (!filteredDeals) {
    return <div>is loading...</div>;
  }
  return (
    <div>
      {isDeals && isDeletable && (
        <div className="flex justify-center items-center absolute z-10 bg-red-500 h-full w-full left-0 top-0 rounded-14 transition-all">
          <Trash size={64} />
        </div>
      )}
      <CardContent className="column flex flex-col gap-2 no-scrollbar overflow-auto h-[calc(100vh-9.625rem)]">
        {filteredDeals?.map((dealObject: SimplifiedDeal, index) => (
          <DealCard deal={dealObject} key={index} />
        ))}
      </CardContent>
    </div>
  );
}
