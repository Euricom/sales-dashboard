import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useContext } from "react";
import { EmployeeCardDragged } from "../../employees/employeeCardDragged";
import { Card, CardContent } from "../card";
import type { BoardRowProps } from "../../../lib/types";
import { DropContext } from "~/contexts/dndProvider";

export function BoardRow({ row, employees, isHeader }: BoardRowProps) {
  const dragItemIds = useMemo(() => {
    return employees.map((employee) => employee.dragItemId);
  }, [employees]);

  const { activeDealId } = useContext(DropContext);

  const variant = row.rowId === activeDealId ? "rowhighlight" : "row";

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
        <SortableContext items={dragItemIds} id={row.rowId}>
          {employees.map((employee) => (
            <EmployeeCardDragged
              key={employee.dragItemId}
              employee={employee}
              isHeader={isHeader}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
