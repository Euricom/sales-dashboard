import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { useContext } from "react";
import { DealContext } from "~/contexts/dealsProvider";

export default function DealsColumn() {
  const { deals } = useContext(DealContext);

  if (!deals) {
    return <div>is loading...</div>;
  }

  return (
    <Card variant="column">
      <CardHeader className="pb-1.5">
        <CardTitle>Deals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {deals?.map((dealObject: SimplifiedDeal, index) => (
          <DealCard deal={dealObject} key={index} />
        ))}
      </CardContent>
    </Card>
  );
}
