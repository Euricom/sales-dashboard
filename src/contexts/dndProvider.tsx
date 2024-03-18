// DndContextProvider.tsx
import React, { createContext, useContext, useState } from "react";
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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { EmployeeCardDragged } from "~/components/employees/employeeCardDragged";
import { v4 as uuidv4 } from "uuid";
import { EmployeeContext } from "~/contexts/employeesProvider";
import { DealContext } from "~/contexts/dealsProvider";

type DropContextType = {
  rowsMogelijkheden: Row[];
  // employeesMogelijkheden: Employee[];
  // setRowsMogelijkheden: React.Dispatch<React.SetStateAction<Row[]>>;
  // setEmployeesMogelijkheden: React.Dispatch<React.SetStateAction<Employee[]>>;
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
  const { deals } = useContext(DealContext);
  // const { employees } = useContext(EmployeeContext);

  const [rowsMogelijkheden, setRowsMogelijkheden] = useState<Row[]>();
  // const [employeesMogelijkheden, setEmployeesMogelijkheden] =
  //   useState<Employee[]>();
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // setEmployeesMogelijkheden(employees);
  // if (!employeesMogelijkheden || !rowsMogelijkheden) {
  //   return <div>Error: No employees found</div>;
  // }

  const mappedRows = deals.map((deal) => ({ rowId: deal.id, dragIds: [] }));
  console.log(deals, "log");
  if (!rowsMogelijkheden) {
    return <div>No Rows Found</div>;
  }

  return (
    <DropContext.Provider
      value={{
        rowsMogelijkheden: mappedRows,
        // employeesMogelijkheden,
        // setRowsMogelijkheden,
        // setEmployeesMogelijkheden,
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
    const isOverAnEmployee = activeData?.type === "Employee";

    if (!isActiveAnEmployee) return;

    // Dropping an Employee over another Employee
    if (isActiveAnEmployee && isOverAnEmployee) {
      // setEmployeesMogelijkheden((employees) => {
      //   const activeIndex = employees.findIndex(
      //     (e) => e.employeeId === activeId,
      //   );
      //   const overIndex = employees.findIndex((e) => e.employeeId === overId);
      //   const activeEmployee = employees[activeIndex];
      //   const overEmployee = employees[overIndex];
      //   if (
      //     activeEmployee &&
      //     overEmployee &&
      //     activeEmployee.rowId !== overEmployee.rowId
      //   ) {
      //     activeEmployee.rowId = overEmployee.rowId;
      //     return arrayMove(employees, activeIndex, overIndex - 1);
      //   }
      //   return arrayMove(employees, activeIndex, overIndex);
      // });
      // setRowsMogelijkheden((rows) => {
      //   if (!rows) return [];
      //   // Active Row
      //   const activeRow = rows.find((row) => row.rowId === activeId);
      //   // Active DragItem Index & Over DragItem Index In Active Row
      //   const activeDragItemIndex = activeRow?.dragIds.findIndex((dragId) => dragId === activeId);
      //   const overDragItemIndex = activeRow?.dragIds.findIndex((dragId) => dragId === overId);

      //   if (!activeDragItemIndex || !overDragItemIndex) return rows;

      //   const activeEmployee = employees.find((employee) => employee.employeeId === );
      //   const overEmployee = activeRow?.dragIds[overDragItemIndex];

      //   if (activeEmployee && overEmployee && activeEmployee.rowId !== overEmployee.rowId) {
      //     activeEmployee.rowId = overEmployee.rowId;
      //     return arrayMove(rows, activeDragItemIndex, overDragItemIndex - 1);
      //   }
      //   return arrayMove(rows, activeDragItemIndex, overDragItemIndex);

      // }
      console.log(active);
    }

    const isOverARow = overData?.type === "Row";

    // // Dropping an Employee over a Row
    // if (isActiveAnEmployee && isOverARow) {
    //   setEmployeesMogelijkheden((employees) => {
    //     const activeIndex = employees.findIndex(
    //       (e) => e.employeeId === activeId,
    //     );
    //     const activeEmployee = employees[activeIndex];
    //     if (activeEmployee) {
    //       activeEmployee.rowId = overId as RowId;
    //       return arrayMove(employees, activeIndex, activeIndex);
    //     }
    //     return employees;
    //   });
    // }

    // const activeEmployee = activeData.employee as Employee;
    // if (activeEmployee.rowId === 0) {
    //   appendEmployee(activeEmployee, overId as RowId);
    // }
  }

  //   // append new employee to employeeMogelijkheden from EmployeeCardGroup
  //   function appendEmployee(employee: Employee, rowId: RowId) {
  //     const isEmployeeAlreadyInRow = alreadyInRow(rowId, employee);
  //     if (isEmployeeAlreadyInRow) {
  //       return;
  //     }
  //     setEmployeesMogelijkheden((employees) => {
  //       const filteredEmployees = employees.filter(
  //         (e) => e.employeeId !== employee.employeeId,
  //       );
  //       const newEmployee = {
  //         ...employee,
  //         employeeId: generateNewEmployeeId(),
  //         rowId,
  //       };
  //       return [...filteredEmployees, newEmployee];
  //     });
  //   }

  //   function generateNewEmployeeId() {
  //     return uuidv4();
  //   }
  //   function alreadyInRow(rowId: RowId, employee: Employee) {
  //     const row = rowsMogelijkheden.find((row) => row.rowId === rowId);
  //     if (!row) return false;
  //     return row;
  //   }
};
