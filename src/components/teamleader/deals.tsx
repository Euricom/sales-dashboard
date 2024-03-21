// import { getTeamleaderData } from "./utils";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";
import { useContext } from "react";
import { DealContext } from "~/providers/dealsProvider";

export default function Deals() {
  const dealsData = useContext(DealContext);

  if (!dealsData) {
    return <div>is loading...</div>;
  }

  return (
    <div data-testid="dealData-loading" className="flex flex-col gap-2">
      {dealsData.deals?.map((dealObject: SimplifiedDeal, index) => (
        <DealCard deal={dealObject} key={index} />
      ))}
    </div>
  );
}
