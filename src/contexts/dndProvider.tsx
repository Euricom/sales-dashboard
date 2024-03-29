import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { hasDraggableData } from "../components/ui/dnd/utils";
import type { Row, Employee } from "~/lib/types";
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
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { EmployeeCardDragged } from "~/components/employees/employeeCardDragged";
import { v4 as uuidv4 } from "uuid";
import { DealContext } from "~/contexts/dealsProvider";

type DropContextType = {
  rowsMogelijkheden: Row[];
  employeesMogelijkheden: Employee[];
  activeDealId: UniqueIdentifier | null;
};

type Sortable = {
  containerId: string;
  index: number;
  items: string[];
};

export const DropContext = createContext<DropContextType>(
  {} as DropContextType,
);

type DndContextProviderProps = {
  children: React.ReactNode;
};

export const DropContextProvider: React.FC<DndContextProviderProps> = ({
  children,
}) => {
  const { deals, isLoading } = useContext(DealContext);
  const [rowsMogelijkheden, setRowsMogelijkheden] = useState<Row[]>([]);
  const [employeesMogelijkheden, setEmployeesMogelijkheden] = useState<
    Employee[]
  >([]);

  useEffect(() => {
    if (!isLoading && deals) {
      const initializedRows = deals.map((deal) => ({
        rowId: deal.id,
        dragItemIds: employeesMogelijkheden
          ? employeesMogelijkheden
              .filter((e) => e.rowId === deal.id)
              .map((e) => e.dragItemId)
          : [],
        employeeIds: employeesMogelijkheden
          ? employeesMogelijkheden
              .filter((e) => e.rowId === deal.id)
              .map((e) => e.employeeId)
          : [],
      }));
      setRowsMogelijkheden(initializedRows);
    }
  }, [isLoading, deals, employeesMogelijkheden]);

  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [activeDealId, setActiveDealId] = useState<UniqueIdentifier | null>(
    null,
  );
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DropContext.Provider
      value={{
        rowsMogelijkheden: rowsMogelijkheden,
        employeesMogelijkheden: employeesMogelijkheden,
        activeDealId: activeDealId,
      }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        {children}
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
    </DropContext.Provider>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    const employee = data?.employee as Employee;
    //This serves as a preview of the place where the employee is being dragged
    if (data?.type === "Employee") {
      setActiveEmployee(employee);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveEmployee(null);
    setActiveDealId(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active) || activeId === overId || !rowsMogelijkheden)
      return;

    // Dropping new Employee over the Board from Header
    const activeData = active.data.current;
    const overData = over.data.current;
    const isActiveAnEmployee = activeData?.type === "Employee";
    const isOverAnEmployee = overData?.type === "Employee";

    if (!isActiveAnEmployee) return;

    const activeEmployee = activeData.employee as Employee;
    if (activeEmployee.rowId === "0") {
      if (isOverAnEmployee) {
        appendEmployee(
          activeEmployee,
          (overData.sortable as Sortable).containerId,
        );
        return;
      }
      appendEmployee(activeEmployee, overId as string);
    }

    // Moving Employee within the same row after dragging from a different row
    setRowsMogelijkheden((rowsMogelijkheden) => {
      if (!rowsMogelijkheden) return [];
      const activeRowIndex = rowsMogelijkheden.findIndex(
        (row) => row.rowId === activeId,
      );

      const overRowIndex = rowsMogelijkheden.findIndex(
        (row) => row.rowId === overId,
      );

      if (activeRowIndex === -1 || overRowIndex === -1)
        return rowsMogelijkheden;

      return arrayMove(rowsMogelijkheden, activeRowIndex, overRowIndex);
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
    const isOverAnEmployee = overData?.type === "Employee";

    // setActiveDealId(over.id); // styling the row where the employee is being dragged when over item is a row

    if (!isActiveAnEmployee) return;

    // if (alreadyInRow(overId as string, activeData.employee as Employee)) return;
    // Dropping an Employee over another Employee
    if (isActiveAnEmployee && isOverAnEmployee) {
      if (over.data.current)
        setActiveDealId((over.data.current.sortable as Sortable).containerId); // styling the row where the employee is being dragged when over item is an employee
      // console.log(over);
      setEmployeesMogelijkheden((employees) => {
        if (employees.length === 0) return [];
        const activeIndex = employees.findIndex(
          (e) => e.dragItemId === activeId,
        );
        const overIndex = employees.findIndex((e) => e.dragItemId === overId);
        const activeEmployee = employees[activeIndex];
        const overEmployee = employees[overIndex];

        if (
          activeEmployee &&
          overEmployee &&
          activeEmployee.rowId !== overEmployee.rowId &&
          !alreadyInRow(overEmployee.rowId, activeEmployee)
        ) {
          activeEmployee.rowId = overEmployee.rowId;
          return arrayMove(employees, activeIndex, overIndex - 1);
        }

        if (
          activeEmployee &&
          overEmployee &&
          !alreadyInRow(overEmployee?.rowId, activeEmployee)
        )
          return arrayMove(employees, activeIndex, overIndex);

        return employees;
      });
      setRowsMogelijkheden((rows) => {
        if (!rows) return [];
        // Active Row
        const activeRow = rows.find((row) => row.rowId === activeId);
        // Active DragItem Index & Over DragItem Index In Active Row
        const activeDragItemIndex = activeRow?.dragItemIds.findIndex(
          (dragItemId) => dragItemId === activeId,
        );
        const overDragItemIndex = activeRow?.dragItemIds.findIndex(
          (dragItemId) => dragItemId === overId,
        );
        if (!activeDragItemIndex || !overDragItemIndex) return rows;
        const activeEmployee = employeesMogelijkheden.find(
          (employee) => employee.dragItemId === activeId,
        );
        const overEmployee = employeesMogelijkheden.find(
          (employee) => employee.dragItemId === overId,
        );
        if (
          activeEmployee &&
          overEmployee &&
          activeEmployee.rowId !== overEmployee.rowId
        ) {
          activeEmployee.rowId = overEmployee.rowId;
          return arrayMove(rows, activeDragItemIndex, overDragItemIndex - 1);
        }

        return arrayMove(rows, activeDragItemIndex, overDragItemIndex);
      });
    }

    const isOverARow = overData?.type === "Row";

    // Dropping an Employee over a Row
    if (isActiveAnEmployee && isOverARow) {
      setEmployeesMogelijkheden((employees) => {
        setActiveDealId(overId);
        const activeIndex = employees.findIndex(
          (e) => e.dragItemId === activeId,
        );
        const activeEmployee = employees[activeIndex];
        // Check if the Employee is already in the Row and if not, move it to the Row
        if (activeEmployee && !alreadyInRow(overId as string, activeEmployee)) {
          activeEmployee.rowId = overId as string;
          return arrayMove(employees, activeIndex, activeIndex);
        }
        return employees;
      });
    }

    // Dropping a new Employee over the Board
    if (activeEmployee?.rowId === "0" && isOverARow) {
      setActiveDealId(overId);
    }
  }

  // append new employee to employeeMogelijkheden from EmployeeCardGroup
  function appendEmployee(activeEmployee: Employee, rowId: string) {
    if (alreadyInRow(rowId, activeEmployee)) {
      return;
    }
    const newEmployee = {
      ...activeEmployee,
      dragItemId: uuidv4(),
      rowId,
    };
    setEmployeesMogelijkheden((employees) => [...employees, newEmployee]);
  }

  function alreadyInRow(rowId: string, employee: Employee) {
    const row = rowsMogelijkheden.find((row) => row.rowId === rowId);
    if (!row) return false;
    return row.employeeIds.some(
      (employeeId) => employeeId === employee.employeeId,
    );
  }
};
