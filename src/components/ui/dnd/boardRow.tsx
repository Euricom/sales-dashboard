import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { EmployeeCardDragged } from "../../employees/employeeCardDragged";
import { Card, CardContent } from "../card";
import type { BoardRowProps } from "../../../lib/types";

export function BoardRow({ row, employees, isHeader }: BoardRowProps) {
  const employeesIds = useMemo(() => {
    return employees.map((employee) => employee.employeeId);
  }, [employees]);

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
    <Card
      ref={setNodeRef}
      style={style}
      className={"min-h-[60px] w-[344 px] max-w-full"}
      variant={"row"}
      size={"row"}
    >
      <CardContent className={`flex gap-2 ${isHeader ? "" : "flex-wrap"}`}>
        <SortableContext items={employeesIds}>
          {employees.map((employee) => (
            <EmployeeCardDragged
              key={employee.employeeId}
              employee={employee}
              isHeader={isHeader}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
