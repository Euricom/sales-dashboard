import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useMemo } from "react";
import { EmployeeCardDragged } from "../../employees/employeeCard";
import { Card, CardContent } from "../card";
import type { BoardRowProps, DraggableEmployee } from "~/lib/types";
import { DropContext } from "~/contexts/dndProvider";
import { EmployeeContext } from "~/contexts/employeesProvider";

export function BoardRow({ row, isHeader, rowStatus }: BoardRowProps) {
  const { activeDealId, activeColumnId } = useContext(DropContext);
  const { draggableEmployees, isFiltering } = useContext(EmployeeContext);
  const draggableEmployeesInThisRow: DraggableEmployee[] = useMemo(() => {
    return draggableEmployees
      .filter((draggableEmployee) => {
        const rowId = (draggableEmployee.dragId as string).split("_")[1];
        const status = (draggableEmployee.dragId as string).split("_")[2];

        if (!isHeader && !status) {
          return rowId === row.rowId.split("_")[0];
        }
        return rowId === "0" && status === rowStatus;
      })
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
  }, [draggableEmployees, row.rowId, isHeader, rowStatus]);

  const dragItemIds = draggableEmployeesInThisRow.map(
    (draggableEmployee) => draggableEmployee.dragId,
  );
  const isMogelijkheden = activeColumnId === "Mogelijkheden";
  const variant =
    row.rowId === activeDealId && !isHeader && isMogelijkheden
      ? "rowhighlight"
      : "row";

  const { setNodeRef, transform, transition } = useSortable({
    id: row.rowId,
    data: {
      type: "Row",
      row,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card ref={setNodeRef} style={style} variant={variant} size={"row"}>
      <CardContent className={`flex gap-2 ${isHeader ? "" : "flex-wrap"}`}>
        <SortableContext
          items={dragItemIds}
          id={row.rowId}
          disabled={isFiltering}
        >
          {draggableEmployeesInThisRow?.map((e) => (
            <EmployeeCardDragged
              key={e.dragId}
              draggableEmployee={e}
              isHeader={isHeader}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
