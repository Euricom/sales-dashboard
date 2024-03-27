import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { hasDraggableData } from "../components/ui/dnd/utils";
import type { Row, DraggableEmployee, Employee } from "~/lib/types";
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
  type Active,
  type Over,
} from "@dnd-kit/core";
import { EmployeeCardDragged } from "~/components/employees/employeeCardDragged";
import { DealContext } from "~/contexts/dealsProvider";
import { EmployeeContext } from "./employeesProvider";

type DropContextType = {
  rows: Row[];
  activeDealId: UniqueIdentifier | null;
};

type Sortable = {
  containerId: string;
  index: number;
  items: string[];
};

type CurrentData = {
  sortable: Sortable;
  type: string;
  employee: Employee;
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
  const { deals, dealPhases, isLoading } = useContext(DealContext);
  const { employees, setEmployees, draggableEmployees } =
    useContext(EmployeeContext);
  const [rows, setRows] = useState<Row[]>([]);
  const [activeEmployee, setActiveEmployee] =
    useState<DraggableEmployee | null>(null);
  const [activeDealId, setActiveDealId] = useState<UniqueIdentifier | null>(
    null,
  );
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // Make the initial empty rows, one row for each deal AND phase. There is always one initial row for the header (rowId="0")
  useEffect(() => {
    if (!isLoading && deals) {
      setRows(
        deals
          .flatMap((deal) =>
            dealPhases.map((phase) => ({
              rowId: `${deal.id}__${phase.name}`,
            })),
          )
          .concat({
            rowId: "0",
          }),
      );
    }
  }, [isLoading, deals, dealPhases]);

  return (
    <DropContext.Provider
      value={{
        rows: rows,
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
                <EmployeeCardDragged
                  draggableEmployee={activeEmployee}
                  isOverlay
                />
              )}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </DropContext.Provider>
  );

  function onDragStart(event: DragStartEvent) {
    const { activeData } = extractEventData(event.active);
    if (!hasDraggableData(event.active) || !activeData) return;
    //This serves as a preview of the place where the employee is being dragged
    if (activeData?.type === "Employee" && activeData?.employee) {
      setActiveEmployee(
        draggableEmployees?.find(
          (draggableEmployee) =>
            (draggableEmployee.dragId as string).split("_")[0] ===
            activeData.employee.employeeId,
        ) ?? null,
      );
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    // if (
    //   !event.over ||
    //   !hasDraggableData(event.active) ||
    //   !hasDraggableData(event.over)
    // )
    //   return;
    // const { overId, overData } = extractEventData({ over: event.over });
    // if (!overId) return;
    // setRowsMogelijkheden((rows) => {
    //   if (!rows) return [];
    //   // overId can be a row or an employee => store the rowId in the activeDealId
    //   if (overData?.type === "Employee")
    //     // if it's an employee
    //     setActiveDealId(overData.sortable.containerId);
    //   if (overData?.type === "Row")
    //     // if it's a row
    //     setActiveDealId(overId);
    //   const rowToEdit = rows.find((row) => row.rowId === activeDealId);
    //   if (!rowToEdit) return rows;
    //   return rows;
    // });
    // // Dropping a new Employee over the Board
    // if (activeEmployee?.rowId === "0") {
    //   setActiveDealId(overId);
    // }
  }

  function onDragEnd(event: DragEndEvent) {
    if (!event.over || !hasDraggableData(event.active)) return;

    const { activeId, overId, overData } = extractEventData(
      event.active,
      event.over,
    );

    if (activeId === overId || !activeEmployee) return;

    const isOverAnEmployee = overData?.type === "Employee";

    // Dropping new Employee over the Board from Header
    if ((activeEmployee?.dragId as string).split("_")[1] === "0") {
      if (isOverAnEmployee) {
        appendEmployee(activeEmployee, overData.sortable.containerId);
        return;
      }
      appendEmployee(activeEmployee, overId as string);
      return;
    }

    setActiveDealId(null);
    setActiveEmployee(null);
  }

  // Helper function to append an employee to a given row
  function appendEmployee(employeeToAppend: DraggableEmployee, rowId: string) {
    if (alreadyInRow(rowId)) {
      return;
    }
    console.log("HERE");

    const employee: Employee | undefined = employees.find((employee) => {
      return (
        employee.employeeId ===
        (employeeToAppend.dragId as string).split("_")[0]
      );
    });
    if (!employee) return;
    const updatedEmployee = {
      ...employee,
      rows: [...employee.rows, rowId],
    };
    setEmployees((employees) => [...employees, updatedEmployee] as Employee[]);
  }

  // Helper function to check if an employee is already in a row
  function alreadyInRow(rowIdToCompare: string) {
    return employees.map((employee) => {
      employee.rows.some((rowId) => rowId === rowIdToCompare);
    });
  }

  // Helper function to extract id's and data objects from active and over
  function extractEventData(active?: Active, over?: Over) {
    const activeId = active?.id;
    const activeData = active?.data.current as CurrentData;
    const overId = over?.id;
    const overData = over?.data.current as CurrentData;

    return { activeId, activeData, overId, overData };
  }
};
