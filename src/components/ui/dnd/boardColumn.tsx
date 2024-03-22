import { useContext, useMemo } from "react";
import { BoardRow } from "./boardRow";
import { SortableContext } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { DropContext } from "~/contexts/dndProvider";

export function BoardColumn({ columnTitle }: { columnTitle: string }) {
  const { rowsMogelijkheden, employeesMogelijkheden } = useContext(DropContext);
  const rowsIds = useMemo(
    () => rowsMogelijkheden.map((row) => row.rowId),
    [rowsMogelijkheden],
  );
  if (
    !employeesMogelijkheden ||
    !rowsMogelijkheden ||
    rowsMogelijkheden.length === 0
  )
    return null;

  return (
    <Card
      variant={"column"}
      size={columnTitle === "Mogelijkheden" ? "columnMogelijkheden" : "column"}
    >
      <CardHeader className="pb-1.5">
        <CardTitle>{columnTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {columnTitle === "Mogelijkheden" && (
          <SortableContext items={rowsIds}>
            {rowsMogelijkheden?.map((row) => (
              <BoardRow
                key={row.rowId}
                row={row}
                employees={employeesMogelijkheden?.filter(
                  (employee) => employee.rowId === row.rowId,
                )}
              />
            ))}
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}
