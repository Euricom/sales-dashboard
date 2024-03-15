// DndContextProvider.tsx
import React, { createContext, useState } from "react";
import { createPortal } from "react-dom";
import { defaultRows, mockEmployees, hasDraggableData } from "./utils";
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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { EmployeeCardDragged } from "~/components/employees/employeeCardDragged";

type RowId = (typeof defaultRows)[number]["rowId"];

type DropContextType = {
  rowsMogelijkheden: Row[];
  employeesMogelijkheden: Employee[];
  setRowsMogelijkheden: React.Dispatch<React.SetStateAction<Row[]>>;
  setEmployeesMogelijkheden: React.Dispatch<React.SetStateAction<Employee[]>>;
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
  const [rowsMogelijkheden, setRowsMogelijkheden] =
    useState<Row[]>(defaultRows);
  const [employeesMogelijkheden, setEmployeesMogelijkheden] =
    useState<Employee[]>(mockEmployees);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DropContext.Provider
      value={{
        rowsMogelijkheden,
        employeesMogelijkheden,
        setRowsMogelijkheden,
        setEmployeesMogelijkheden,
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

    if (activeId === overId) return;

    setRowsMogelijkheden((rowsMogelijkheden) => {
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
    const isOverAnEmployee = activeData?.type === "Employee";

    if (!isActiveAnEmployee) return;

    // Dropping an Employee over another Employee
    if (isActiveAnEmployee && isOverAnEmployee) {
      setEmployeesMogelijkheden((employees) => {
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
      setEmployeesMogelijkheden((employees) => {
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

    const activeEmployee = activeData.employee as Employee;
    if (activeEmployee.rowId === 0) {
      appendEmployee(activeEmployee, overId as RowId);
    }
  }

  // append new employee to employeeMogelijkheden from EmployeeCardGroup
  function appendEmployee(employee: Employee, rowId: RowId) {
    setEmployeesMogelijkheden((employees) => {
      const newEmployee = { ...employee, rowId };
      return [...employees, newEmployee];
    });
    // setEmployeesMogelijkheden((employees) => {
    //   const filteredEmployees = employees.filter(
    //     (e) => e.employeeId !== employee.employeeId,
    //   );
    //   const newEmployee = {
    //     ...employee,
    //     employeeId: generateNewEmployeeId(),
    //     rowId,
    //   };
    //   return [...filteredEmployees, newEmployee];
    // });
  }

  // function generateNewEmployeeId() {
  //   const maxEmployeeId = Math.max(
  //     ...employeesMogelijkheden.map((e) => Number(e.employeeId)),
  //   );
  //   return maxEmployeeId + 1;
  // }
};
