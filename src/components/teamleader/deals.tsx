import { getTeamleaderData } from "./utils";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";

export default function Deals() {
  const dealsData = getTeamleaderData();

  if (!dealsData) {
    return <div>is loading...</div>;
  }

  return (
    <>
      {dealsData.data?.map((dealObject: SimplifiedDeal, index) => (
        <DealCard deal={dealObject} key={index} />
      ))}
    </>
  );
}
