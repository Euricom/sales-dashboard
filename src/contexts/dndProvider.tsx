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
import { EmployeeCardDragged } from "~/components/employees/employeeCard";
import { DealContext } from "~/contexts/dealsProvider";
import { EmployeeContext } from "./employeesProvider";
import { api } from "~/utils/api";

type DropContextType = {
  rows: Row[];
  activeDealId: UniqueIdentifier | undefined;
  activeColumnId: UniqueIdentifier | undefined;
  isDeletable: boolean;
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
  const { filteredDeals, dealPhases, isLoading, getDealInfo } =
    useContext(DealContext);
  const { employees, setEmployees, draggableEmployees } =
    useContext(EmployeeContext);
  const [rows, setRows] = useState<Row[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<DraggableEmployee>();
  const [activeDealId, setActiveDealId] = useState<UniqueIdentifier>();
  const [activeColumnId, setActiveColumnId] = useState<UniqueIdentifier>();
  const [isDeletable, setDeletable] = useState<boolean>(false);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );
  const employeeUpdator = api.mongodb.updateEmployee.useMutation();
  // Make the initial empty rows, one row for each deal AND phase. There is always one initial row for the header (rowId="0")
  useEffect(() => {
    if (!isLoading && filteredDeals) {
      setRows(
        filteredDeals
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
  }, [isLoading, filteredDeals, dealPhases]);

  return (
    <DropContext.Provider
      value={{
        rows: rows,
        activeDealId: activeDealId,
        activeColumnId: activeColumnId,
        isDeletable: isDeletable,
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
    const { activeData, activeRowId } = extractEventData(event.active);
    if (!hasDraggableData(event.active) || !activeData) return;

    activeRowId === "0" ? setDeletable(false) : setDeletable(true); // check if card is from header

    //This serves as a preview of the place where the employee is being dragged
    if (activeData.type === "Employee" && activeData.employee) {
      setActiveEmployee(
        draggableEmployees.find((draggableEmployee) => {
          return draggableEmployee.dragId === activeData.dragId;
        }) ?? undefined,
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

    const { activeId, overId, overData } = extractEventData(
      event.active,
      event.over,
    );

    if (!overId) return;

    // Highlight the correct column and/or deal
    if (overData?.type === "Employee") {
      setActiveColumnId(overId.split("/")[1] as UniqueIdentifier);
      if (["Mogelijkheden", "Voorgesteld"].includes(overId.split("/")[1]!)) {
        return;
      } else {
        setActiveDealId(activeId.split("_")[1] as UniqueIdentifier);
      }
      return;
    }
    if (overData?.type === "Row") {
      setActiveColumnId(overId.split("/")[1] as UniqueIdentifier);
      if (["Mogelijkheden", "Voorgesteld"].includes(overId.split("/")[1]!)) {
        setActiveDealId(overId);
      } else {
        setActiveDealId(activeId.split("_")[1] as UniqueIdentifier);
      }
      return;
    }
    setActiveColumnId(overId);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveDealId(undefined);
    setActiveColumnId(undefined);
    setDeletable(false);

    if (!event.over || !hasDraggableData(event.active)) return;
    const { activeId, overId, overData, activeRowId, overRowId } =
      extractEventData(event.active, event.over);

    if (activeId === overId || !activeEmployee || activeColumnId === "Deals")
      return;
    const isOverAnEmployee = overData?.type === "Employee";

    // Dropping Employee over the header FROM Mogelijkheden (Delete Employee)
    if (
      activeRowId !== "0" &&
      overId.split("_")[1] === "0" &&
      (event.active.id as string).split("/")[1] === "Mogelijkheden"
    ) {
      removeEmployee(activeEmployee, activeRowId);
    }

    // Dragging Employee between rows (Move employee)
    if (activeRowId !== "0") {
      // Dropping Employee over the same row or over the header (Do nothing)
      if (!activeRowId || activeRowId === overRowId || overRowId === "0") {
        return;
      }
      // Dropping Employee over another Employee in a different row
      if (isOverAnEmployee && overId.split("_")[1] !== "0") {
        moveEmployee(
          activeEmployee,
          activeRowId,
          overData.sortable.containerId,
        );
      } else if (overId.split("_")[1] === "0") {
        return;
      } else {
        // Dropping Employee over a different row
        moveEmployee(activeEmployee, activeRowId, overId);
      }
    }

    // Dropping new Employee over the Board from Header
    if (
      activeRowId === "0" &&
      ["Mogelijkheden", "Voorgesteld"].includes(activeColumnId as string)
    ) {
      const employee = findEmployee(activeEmployee);
      if (!employee) return;

      // over an employee
      if (isOverAnEmployee) {
        if (
          !isAllowedToDrop(
            activeEmployee,
            overData.sortable.containerId,
            employee,
          )
        ) {
          return;
        }
        appendEmployee(employee, overData.sortable.containerId);
      } else {
        // over a row
        if (!isAllowedToDrop(activeEmployee, overId, employee)) {
          return;
        }
        appendEmployee(employee, overId);
      }
    }
    setActiveEmployee(undefined);
  }

  // Helper function to append an employee to a given row
  function appendEmployee(employee: Employee, rowId: string) {
    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          emp.rows.push(rowId);
          updateTeamleader(
            rowId.split("/")[0],
            emp.fields.Euricom_x0020_email,
            rowId.split("/")[1],
          );
          updateEmployeeInDB(emp); // Update the employee in the database
          return emp;
        }
        return emp;
      });
      return updatedEmployees;
    });
  }

  // Helper function to remove an employee from a row
  function removeEmployee(draggableEmployee: DraggableEmployee, rowId: string) {
    const employee = findEmployee(draggableEmployee);
    if (!employee) return;

    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          emp.rows = emp.rows.filter((row) => row !== rowId);
          updateEmployeeInDB(emp); // Update the employee in the database
          return emp;
        }
        return emp;
      });
      return updatedEmployees;
    });
  }

  // Helper function to move an employee from one row to another
  function moveEmployee(
    draggableEmployee: DraggableEmployee,
    initialRowId: string,
    targetId: string,
  ) {
    // Find the employee to move
    const employee = findEmployee(draggableEmployee);
    if (!employee) return;
    // Check if move is allowed
    if (!isAllowedToDrop(draggableEmployee, targetId, employee)) {
      // Handle special cases
      const newTargetId = handleSpecialCases(initialRowId, targetId);
      if (!newTargetId) return;
      targetId = newTargetId;
    }
    // Update the employees state
    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          const indexOfRowToRemove = emp.rows.indexOf(initialRowId);

          if (indexOfRowToRemove !== -1) {
            const updatedRows = [...emp.rows]; // Create a copy of rows array
            updatedRows.splice(indexOfRowToRemove, 1, targetId); // Replace the row
            emp.rows = updatedRows;
            updateTeamleader(
              targetId.split("/")[0],
              emp.fields.Euricom_x0020_email,
              targetId.split("/")[1],
            );

            updateEmployeeInDB(emp); // Update the employee in the database
            return emp;
          }
        }
        return emp;
      });
      return updatedEmployees;
    });
  }

  // Helper function to check if an employee is already in a row
  function isAllowedToDrop(
    draggableEmployee: DraggableEmployee,
    rowIdToCompare: string,
    employee: Employee,
  ) {
    const [initialRowId, initialRowStatus] =
      (draggableEmployee.dragId as string).split("_")[1]?.split("/") ?? [];
    const [targetRowId, targetRowStatus] = rowIdToCompare.split("/");
    // Inside the same row
    if (initialRowId === targetRowId && initialRowStatus === "Mogelijkheden")
      return true;

    // Not in the same row and row does not exist in employee.rows
    if (
      initialRowId !== targetRowId &&
      !employee?.rows.some(
        (row) => (row as string).split("/")[0] === targetRowId,
      )
    ) {
      // Can you drag into the target row from the header?
      if (
        (targetRowStatus === "Mogelijkheden" && initialRowId === "0") ||
        (targetRowStatus === "Voorgesteld" &&
          (initialRowStatus === "Mogelijkheden" || initialRowId === "0"))
      ) {
        return true;
      }
    }

    return false;
  }

  // Helper function to extract id's and data objects from active and over
  function extractEventData(active?: Active, over?: Over) {
    const activeId = active?.id as string;
    const activeData = active?.data.current as CurrentData;
    const overId = over?.id as string;
    const overData = over?.data.current as CurrentData;
    const activeRowId = activeData?.sortable.containerId;
    const overRowId = overData?.row?.rowId;

    return { activeId, activeData, overId, overData, activeRowId, overRowId };
  }

  // Helper function to find an employee by dragId
  function findEmployee(employeeToFind: DraggableEmployee) {
    return employees.find((employee) => {
      return (
        employee.employeeId === (employeeToFind.dragId as string).split("_")[0]
      );
    });
  }

  // Helper function to handle special cases
  function handleSpecialCases(initialRowId: string, targetId: string) {
    // If the target row is not the correct row to drop the employee
    // Check if the target is a column not equal to the initial column

    // If the target is a column and not a row
    //    AND the initial row is not the same as the target row
    //    THEN return a new targetId with the same dealId but different status
    if (
      ["Interview", "Weerhouden", "Niet-Weerhouden", "Voorgesteld"].includes(
        targetId,
      ) &&
      initialRowId.split("/")[1] !== targetId
    ) {
      return (targetId = initialRowId.split("/")[0] + "/" + targetId);
    }
    // If the target is a row
    //   AND the initial row status is not the same as the target row status
    //   AND the target is not "Mogelijkheden" or "Voorgesteld"
    else if (
      (targetId.split("/")[1] ?? targetId) !== initialRowId.split("/")[1] &&
      (targetId.split("/")[1] ?? targetId) !== "Mogelijkheden"
    ) {
      return (targetId =
        initialRowId.split("/")[0] + "/" + targetId.split("/")[1]);
    }
    // If the target is a row in "Mogelijkheden"
    else if ((targetId.split("/")[1] ?? targetId) === "Mogelijkheden") {
      return (targetId = initialRowId);
    } else {
      return;
    }
  }

  function updateEmployeeInDB(employee: Employee) {
    employeeUpdator.mutate({
      employee: {
        employeeId: employee.employeeId,
        rows: employee.rows as string[],
      },
    });
  }

  function updateTeamleader(
    dealId: string | undefined,
    email: string | null,
    phaseName: string | undefined,
  ) {
    if (!dealId || !phaseName || phaseName === "Mogelijkheden") {
      return;
    }
    email = email ?? "";
    getDealInfo(dealId, email, phaseName);
  }
};
