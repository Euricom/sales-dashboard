import { getTeamleaderData } from "./utils";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";

export default function DealsColumn() {
  const dealsData = getTeamleaderData();

  if (!dealsData) {
    return <div>is loading...</div>;
  }

  return (
    <Card variant="column">
      <CardHeader className="pb-1.5">
        <CardTitle>Deals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {dealsData.data?.map((dealObject: SimplifiedDeal, index) => (
          <DealCard deal={dealObject} key={index} />
        ))}
      </CardContent>
    </Card>
  );
}
