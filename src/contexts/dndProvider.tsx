// DndContextProvider.tsx
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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { EmployeeCardDragged } from "~/components/employees/employeeCardDragged";
import { v4 as uuidv4 } from "uuid";
import { DealContext } from "~/contexts/dealsProvider";

type DropContextType = {
  rowsMogelijkheden: Row[];
  employeesMogelijkheden: Employee[];
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
  const { deals, isLoading } = useContext(DealContext);
  // console.log(deals, "deals");
  // const { employees } = useContext(EmployeeContext);
  const [rowsMogelijkheden, setRowsMogelijkheden] = useState<Row[]>([]);
  const [employeesMogelijkheden, setEmployeesMogelijkheden] = useState<
    Employee[]
  >([
    {
      dragItemId: uuidv4(),
      employeeId: uuidv4(),
      rowId: "3d300840-a767-0b39-a97e-76e2218286b3",
      fields: {
        Title: "John Doe",
        City: "New York",
        Job_x0020_title: "Software Engineer",
        Level: "Senior",
        Status: "Active",
        Contract_x0020_Substatus: "Full-time",
      },
    },
    {
      dragItemId: uuidv4(),
      employeeId: uuidv4(),
      rowId: "e5d8a575-6cf2-0968-997c-5205d181ea5a",
      fields: {
        Title: "Jane Smith",
        City: "San Francisco",
        Job_x0020_title: "Product Manager",
        Level: "Senior",
        Status: "Active",
        Contract_x0020_Substatus: "Full-time",
      },
    },
    {
      dragItemId: uuidv4(),
      employeeId: uuidv4(),
      rowId: "55159183-aa1d-0710-827c-df89217ea48c",
      fields: {
        Title: "Mike Johnson",
        City: "Seattle",
        Job_x0020_title: "Data Scientist",
        Level: "Junior",
        Status: "Active",
        Contract_x0020_Substatus: "Part-time",
      },
    },
  ]);

  useEffect(() => {
    if (!isLoading && deals) {
      const initializedRows = deals.map((deal) => ({
        rowId: deal.id,
        dragItemIds: employeesMogelijkheden
          ? employeesMogelijkheden
              .filter((e) => e.rowId === deal.id)
              .map((e) => e.dragItemId)
          : [],
      }));
      setRowsMogelijkheden(initializedRows);
    }
  }, [isLoading, deals, employeesMogelijkheden]);

  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DropContext.Provider
      value={{
        rowsMogelijkheden: rowsMogelijkheden,
        employeesMogelijkheden: employeesMogelijkheden,
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

    if (!rowsMogelijkheden) return;

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

    const activeData = active.data.current;
    const isActiveAnEmployee = activeData?.type === "Employee";
    if (!isActiveAnEmployee) return;

    const activeEmployee = activeData.employee as Employee;
    if (activeEmployee.rowId === "0") {
      appendEmployee(activeEmployee, overId as string);
    }
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
          activeEmployee.rowId !== overEmployee.rowId
        ) {
          activeEmployee.rowId = overEmployee.rowId;
          return arrayMove(employees, activeIndex, overIndex - 1);
        }
        return arrayMove(employees, activeIndex, overIndex);
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
        const activeIndex = employees.findIndex(
          (e) => e.dragItemId === activeId,
        );
        const activeEmployee = employees[activeIndex];
        if (activeEmployee) {
          activeEmployee.rowId = overId as string;
          return arrayMove(employees, activeIndex, activeIndex);
        }
        return employees;
      });
    }

    // This serves as a preview of the place where the employee being dragged
    // const activeEmployee = activeData.employee as Employee;
    // if (activeEmployee.rowId === "0") {
    //   // appendEmployee(activeEmployee, overId as string);
    //   previewEmployee(activeEmployee, overId as string);
    // }
  }

  // append new employee to employeeMogelijkheden from EmployeeCardGroup
  function appendEmployee(employee: Employee, rowId: string) {
    const isEmployeeAlreadyInRow = alreadyInRow(rowId, employee);
    if (isEmployeeAlreadyInRow) {
      return;
    }

    const newEmployee = {
      ...employee,
      dragItemId: uuidv4(),
      rowId,
    };

    setEmployeesMogelijkheden((employees) => {
      const filteredEmployees = employees.filter(
        (e) => e.dragItemId !== employee.dragItemId,
      );

      return [...filteredEmployees, newEmployee];
    });
  }

  function alreadyInRow(rowId: string, employee: Employee) {
    const row = rowsMogelijkheden.find((row) => row.rowId === rowId);
    if (!row) return false;
    return row.dragItemIds.some(
      (dragItemId) => dragItemId === employee.dragItemId,
    );
  }
  // // preview new employee from EmployeeCardGroup above mogelijkheden row
  // function previewEmployee(employee: Employee, rowId: string) {
  //   const isEmployeeAlreadyInRow = alreadyInRow(rowId, employee);
  //   if (isEmployeeAlreadyInRow) {
  //     return;
  //   }

  //   const newEmployee = {
  //     ...employee,
  //     dragItemId: uuidv4(),
  //     rowId,
  //   };

  //   setEmployeesMogelijkheden((employees) => {
  //     const filteredEmployees = employees.filter(
  //       (e) => e.dragItemId !== employee.dragItemId,
  //     );

  //     return [...filteredEmployees, newEmployee];
  //   });
  // }
};
