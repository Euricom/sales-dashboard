import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { BoardRow } from "./boardRow";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { defaultRows, hasDraggableData, initialEmployees } from "./utils";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import type { Row, Employee } from "~/lib/types";
import { EmployeeCardDragged } from "~/components/employees/employeeCardDragged";

export type RowId = (typeof defaultRows)[number]["rowId"];

export function BoardColumn({ columnTitle }: { columnTitle: string }) {
  const [rows, setRows] = useState<Row[]>(defaultRows);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const rowsIds = useMemo(() => rows.map((row) => row.rowId), [rows]);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <Card>
        <CardHeader className="pb-1.5">
          <CardTitle>{columnTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 w-[344px]">
          <SortableContext items={rowsIds}>
            {rows.map((row) => (
              <BoardRow
                key={row.rowId}
                row={row}
                employees={employees.filter(
                  (employee) => employee.rowId === row.rowId,
                )}
              />
            ))}
          </SortableContext>
        </CardContent>
      </Card>

      {"document" in window &&
        createPortal(
          <DragOverlay>
            {activeEmployee && (
              <EmployeeCardDragged employee={activeEmployee} isOverlay />
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;

    if (data?.type === "Employee") {
      setActiveEmployee(data.employee as Employee);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveEmployee(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveARow = activeData?.type === "Row";
    if (!isActiveARow) return;

    setRows((rows) => {
      const activeRowIndex = rows.findIndex((row) => row.rowId === activeId);

      const overRowIndex = rows.findIndex((row) => row.rowId === overId);

      return arrayMove(rows, activeRowIndex, overRowIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveAnEmployee = activeData?.type === "Employee";
    const isOverAnEmployee = activeData?.type === "Employee";

    if (!isActiveAnEmployee) return;

    // Dropping an Employee over another Employee
    if (isActiveAnEmployee && isOverAnEmployee) {
      setEmployees((employees) => {
        const activeIndex = employees.findIndex(
          (e) => e.employeeId === activeId,
        );
        const overIndex = employees.findIndex((e) => e.employeeId === overId);
        const activeEmployee = employees[activeIndex];
        const overEmployee = employees[overIndex];
        if (
          activeEmployee &&
          overEmployee &&
          activeEmployee.rowId !== overEmployee.rowId
        ) {
          activeEmployee.rowId = overEmployee.rowId;
          return arrayMove(employees, activeIndex, overIndex - 1);
        }
        return arrayMove(employees, activeIndex, overIndex);
      });
    }

    const isOverARow = overData?.type === "Row";

    // Dropping an Employee over a Row
    if (isActiveAnEmployee && isOverARow) {
      console.log("Dropping an Employee over a Row");
      setEmployees((employees) => {
        const activeIndex = employees.findIndex(
          (e) => e.employeeId === activeId,
        );
        const activeEmployee = employees[activeIndex];
        if (activeEmployee) {
          activeEmployee.rowId = overId as RowId;
          return arrayMove(employees, activeIndex, activeIndex);
        }
        return employees;
      });
    }
  }
}
