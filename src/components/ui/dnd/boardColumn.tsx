import { useContext, useMemo } from "react";
import { BoardRow } from "./boardRow";
import { SortableContext } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { DropContext } from "./dndProvider";

export function BoardColumn({ columnTitle }: { columnTitle: string }) {
  const { rowsMogelijkheden, employeesMogelijkheden } = useContext(DropContext);
  const rowsIds = useMemo(
    () => rowsMogelijkheden.map((row) => row.rowId),
    [rowsMogelijkheden],
  );

  return (
    <Card>
      <CardHeader className="pb-1.5">
        <CardTitle>{columnTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 w-[344px]">
        <SortableContext items={rowsIds}>
          {rowsMogelijkheden.map((row) => (
            <BoardRow
              key={row.rowId}
              row={row}
              employees={employeesMogelijkheden.filter(
                (employee) => employee.rowId === row.rowId,
              )}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
