import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import DealCard from "./dealCard";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { useContext } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import { EmployeeContext } from "~/contexts/employeesProvider";

export default function DealsColumn() {
  const { filteredDeals, setDealIds } = useContext(DealContext);
  const { setEmployeeId } = useContext(EmployeeContext);

  if (!filteredDeals) {
    return <div>is loading...</div>;
  }
  return (
    <Card
      variant="column"
      onClick={() => {
        setDealIds([]);
        setEmployeeId("");
      }}
    >
      <CardHeader className="pb-1.5">
        <CardTitle>Deals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {filteredDeals?.map((dealObject: SimplifiedDeal, index) => (
          <DealCard deal={dealObject} key={index} />
        ))}
      </CardContent>
    </Card>
  );
}
