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
  dragId: UniqueIdentifier;
  row?: Row;
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
              rowId: `${deal.id}/${phase.name}`,
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
    if (activeData.type === "Employee" && activeData.employee) {
      setActiveEmployee(
        draggableEmployees.find((draggableEmployee) => {
          return draggableEmployee.dragId === activeData.dragId;
        }) ?? null,
      );
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    if (
      !event.over ||
      !hasDraggableData(event.active) ||
      !hasDraggableData(event.over)
    )
      return;

    const { overId } = extractEventData(undefined, event.over);
    if (!overId) return;

    setActiveDealId(overId);
  }

  function onDragEnd(event: DragEndEvent) {
    if (!event.over || !hasDraggableData(event.active)) return;

    const { activeId, overId, overData, activeRowId, overRowId } =
      extractEventData(event.active, event.over);

    if (activeId === overId || !activeEmployee) return;
    const isOverAnEmployee = overData?.type === "Employee";
    // Dragging Employee between rows
    if (activeRowId !== "0") {
      if (!activeRowId || !overRowId || activeRowId === overRowId) return;
      // Dropping Employee over another Employee in a different row
      if (isOverAnEmployee) {
        moveEmployee(
          activeEmployee,
          activeRowId,
          overData.sortable.containerId,
        );
        setActiveDealId(null);
        setActiveEmployee(null);
      } else {
        // Dropping Employee over a different row
        moveEmployee(activeEmployee, activeRowId, overId as string);
        setActiveDealId(null);
        setActiveEmployee(null);
      }
    }
    // Dropping new Employee over the Board from Header
    if (activeRowId === "0") {
      if (isOverAnEmployee) {
        appendEmployee(activeEmployee, overData.sortable.containerId);
        setActiveDealId(null);
        setActiveEmployee(null);
        return;
      }
      appendEmployee(activeEmployee, overId as string);
      setActiveDealId(null);
      setActiveEmployee(null);
      return;
    }
    setActiveDealId(null);
    setActiveEmployee(null);
  }

  // Helper function to append an employee to a given row
  function appendEmployee(employeeToAppend: DraggableEmployee, rowId: string) {
    if (alreadyInRow(employeeToAppend, rowId)) {
      return;
    }

    const employee = employees.find((employee) => {
      return (
        employee.employeeId ===
        (employeeToAppend.dragId as string).split("_")[0]
      );
    });
    if (!employee) return;

    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          return {
            ...emp,
            rows: [...emp.rows, rowId],
          };
        }
        return emp;
      });
      return updatedEmployees;
    });
  }

  // Helper function to remove an employee from a row
  function removeEmployee(employeeToRemove: DraggableEmployee, rowId: string) {
    const employee = employees.find((employee) => {
      return (
        employee.employeeId ===
        (employeeToRemove.dragId as string).split("_")[0]
      );
    });
    if (!employee) return;

    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          return {
            ...emp,
            rows: emp.rows.filter((row) => row !== rowId),
          };
        }
        return emp;
      });
      return updatedEmployees;
    });
  }

  // Helper function to move an employee from one row to another
  function moveEmployee(
    employeeToMove: DraggableEmployee,
    initalRowId: string,
    targetRowId: string,
  ) {
    if (alreadyInRow(employeeToMove, targetRowId)) {
      return;
    }
    const employee = employees.find((employee) => {
      return (
        employee.employeeId === (employeeToMove.dragId as string).split("_")[0]
      );
    });
    if (!employee) return;

    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          const indexOfRowToRemove = emp.rows.findIndex(
            (row) => row === initalRowId,
          );
          if (indexOfRowToRemove !== -1) {
            const updatedRows = [...emp.rows]; // Create a copy of rows array
            updatedRows.splice(indexOfRowToRemove, 1, targetRowId); // Replace the row
            return {
              ...emp,
              rows: updatedRows,
            };
          }
        }
        return emp;
      });
      return updatedEmployees;
    });
  }

  // Helper function to check if an employee is already in a row
  function alreadyInRow(emloyee: DraggableEmployee, rowIdToCompare: string) {
    const employee = employees.find(
      (employee) =>
        employee.employeeId === (emloyee.dragId as string).split("_")[0],
    );
    return employee?.rows.some((row) => row === rowIdToCompare);
  }

  // Helper function to extract id's and data objects from active and over
  function extractEventData(active?: Active, over?: Over) {
    const activeId = active?.id;
    const activeData = active?.data.current as CurrentData;
    const overId = over?.id;
    const overData = over?.data.current as CurrentData;
    const activeRowId = activeData?.sortable.containerId;
    const overRowId = overData?.row?.rowId;

    return { activeId, activeData, overId, overData, activeRowId, overRowId };
  }
};
