import { getTeamleaderData } from "./utils";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";

export default function Deals() {
  const dealsData = getTeamleaderData();

  if (!dealsData) {
    return <div>is loading...</div>;
  }

  return (
    <div data-testid="dealData-loading" className="flex flex-col gap-2">
      {dealsData.data?.map((dealObject: SimplifiedDeal, index) => (
        <DealCard deal={dealObject} key={index} />
      ))}
    </div>
  );
}
