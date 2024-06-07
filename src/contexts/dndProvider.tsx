import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { hasDraggableData } from "../components/ui/dnd/utils";
import {
  type Row,
  type DraggableEmployee,
  type Employee,
  DealName,
} from "~/lib/types";
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
import { showToastForMoveNotAllowed } from "~/lib/utils";

type DropContextType = {
  rows: Row[];
  activeDealId: UniqueIdentifier | undefined;
  activeColumnId: UniqueIdentifier | undefined;
  isDeletable: boolean;
  groupedDealsToWrap: string[];
  appendGroupedDeal: (groupedDealId: string) => void;
  removeGroupedDeal: (groupedDealId: string) => void;
  confetti: boolean;
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
  const {
    filteredDeals,
    dealPhases,
    isLoading,
    updateOrCreateDeal,
    moveDeal,
    uniqueDeals,
  } = useContext(DealContext);
  const { employees, setEmployees, draggableEmployees } =
    useContext(EmployeeContext);
  const [rows, setRows] = useState<Row[]>([]);
  const [activeEmployee, setActiveEmployee] = useState<DraggableEmployee>();
  const [activeDealId, setActiveDealId] = useState<UniqueIdentifier>();
  const [activeColumnId, setActiveColumnId] = useState<UniqueIdentifier>();
  const [isDeletable, setDeletable] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<boolean>(false);
  const [groupedDealsToWrap, setGroupedDealsToWrap] = useState<string[]>([]);
  const [isNotAllowedToMoveOrDrop, setIsNotAllowedToMoveOrDrop] =
    useState<boolean>(false);

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
              rowId: `${deal.groupedDealId}/${phase.name}`,
            })),
          )
          .concat({
            rowId: "0",
          }),
      );
    }
  }, [isLoading, filteredDeals, dealPhases]);

  // Display toast when user makes a wrong move
  useEffect(() => {
    if (isNotAllowedToMoveOrDrop) {
      showToastForMoveNotAllowed();
      setIsNotAllowedToMoveOrDrop(false);
    }
  }, [isNotAllowedToMoveOrDrop]);

  // Add & remove id to groupedDealsToWrap
  const appendGroupedDeal = (groupedDealId: string) => {
    setGroupedDealsToWrap([...groupedDealsToWrap, groupedDealId]);
  };
  const removeGroupedDeal = (groupedDealId: string) => {
    setGroupedDealsToWrap(
      groupedDealsToWrap.filter((id) => id !== groupedDealId),
    );
  };

  return (
    <DropContext.Provider
      value={{
        rows,
        activeDealId,
        activeColumnId,
        isDeletable,
        groupedDealsToWrap,
        appendGroupedDeal,
        removeGroupedDeal,
        confetti,
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
    const columnName = overId.split("/")[1]!;
    // Highlight the correct column and/or deal
    if (overData?.type === "Employee") {
      setActiveColumnId(columnName);

      const overDealId = overId.split("_")[1];
      if (
        columnName === DealName.Opportunities.toString() ||
        columnName === DealName.Proposed.toString()
      ) {
        setActiveDealId(overDealId);
        return;
      } else {
        setActiveDealId(activeDealId);
      }
      return;
    }
    if (overData?.type === "Row") {
      setActiveColumnId(columnName);
      if (
        columnName === DealName.Opportunities.toString() ||
        columnName === DealName.Proposed.toString()
      ) {
        setActiveDealId(overId);
      } else {
        setActiveDealId(activeId.split("_")[1]);
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

    if (activeId === overId || !activeEmployee || activeColumnId === "Deals") {
      return;
    }
    const isOverAnEmployee = overData?.type === "Employee";

    // Dropping Employee over the header FROM Opportunities (Delete Employee)
    if (
      activeRowId !== "0" &&
      overId.split("_")[1] === "0" &&
      (event.active.id as string).split("/")[1] === DealName.Opportunities
    ) {
      removeEmployee(activeEmployee, activeRowId);
      return;
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
        return;
      } else if (overId.split("_")[1] === "0") {
        setIsNotAllowedToMoveOrDrop(true);
        return;
      } else {
        // Dropping Employee over a different row
        moveEmployee(activeEmployee, activeRowId, overId);
        if (overId.split("/")[1] === DealName.Retained) {
          setConfetti(true);

          setTimeout(() => {
            setConfetti(false);
          }, 3000);
        }
        return;
      }
    }

    // Dropping new Employee over the Board from Header
    if (
      activeRowId === "0" &&
      (DealName.Opportunities === activeColumnId ||
        DealName.Proposed === activeColumnId)
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
        appendEmployee(employee, activeRowId, overData.sortable.containerId);
      } else {
        // over a row
        if (!isAllowedToDrop(activeEmployee, overId, employee)) {
          setIsNotAllowedToMoveOrDrop(true);
          return;
        }
        appendEmployee(employee, activeRowId, overId);
      }
    } else if (
      activeRowId === "0" &&
      activeColumnId &&
      [DealName.Interview, DealName.Retained, DealName.NonRetained].includes(
        activeColumnId.toString() as DealName,
      )
    ) {
      // Indicate that dragging from header to other columns is not allowed
      setIsNotAllowedToMoveOrDrop(true);
    }

    setActiveEmployee(undefined);
  }

  // Helper function to append an employee to a given row
  function appendEmployee(
    employee: Employee,
    activeRowId: string,
    rowId: string,
  ) {
    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          // find the dealId of the row where the employee is being dropped in uniqueDeals
          updateTeamleader(
            rowId.split("/")[0],
            rowId.split("/")[1],
            emp,
            activeRowId.split("/")[1],
          );
          emp.rows.push(rowId);
          emp.deals?.push({
            dealId:
              uniqueDeals?.find((deal) => deal.id === rowId.split("/")[0])
                ?.value[0] ?? "",
            date: new Date(),
          });
          updateEmployeeInDB(emp, rowId); // Update the employee in the database
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
          // find the dealId of the row where the employee is being dropped in uniqueDeals
          const dealId = uniqueDeals?.find(
            (deal) => deal.id === rowId.split("/")[0],
          )?.value[0];
          emp.deals =
            emp.deals?.filter((deal) => deal.dealId !== dealId) ?? null;

          updateEmployeeInDB(emp, undefined); // Update the employee in the database
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
    if (initialRowId === targetId) return;

    // Update the employees state
    setEmployees((employees) => {
      const updatedEmployees = employees.map((emp) => {
        if (emp.employeeId === employee.employeeId) {
          const indexOfRowToRemove = emp.rows.indexOf(initialRowId);

          if (indexOfRowToRemove !== -1) {
            const updatedRows = emp.rows.filter((id) => {
              return id !== initialRowId;
            }); // Create a copy of rows array
            updatedRows.push(targetId); // Replace the row
            emp.rows = updatedRows;

            updateTeamleader(
              targetId.split("/")[0],
              targetId.split("/")[1],
              emp,
              initialRowId.split("/")[1],
            );
            updateEmployeeInDB(emp, targetId); // Update the employee in the database
            return emp;
          }
        }
        return emp;
      });
      return updatedEmployees;
    });
  }

  // Helper function to check if the dragging action is allowed
  function isAllowedToDrop(
    draggableEmployee: DraggableEmployee,
    rowIdToCompare: string,
    employee: Employee,
  ) {
    const [initialRowId, initialRowPhase] =
      (draggableEmployee.dragId as string).split("_")[1]?.split("/") ?? [];
    const [targetRowId, targetRowPhase] = rowIdToCompare.split("/");

    // Dragging in the same deal: ALLOWED
    if (initialRowId === targetRowId) {
      // An employee can NOT be dragged to the opportunities column within the same deal: NOT ALLOWED
      if (
        targetRowPhase === DealName.Opportunities &&
        initialRowPhase !== DealName.Opportunities
      ) {
        setIsNotAllowedToMoveOrDrop(true);
        return false;
      }
      return true;
    }

    // Check if the employee is already assigned to the deal (regardless of phase): NOT ALLOWED
    const isTargetRowIdInEmployeeRows = employee?.rows.some(
      (row) => (row as string).split("/")[0] === targetRowId,
    );
    if (isTargetRowIdInEmployeeRows) {
      setIsNotAllowedToMoveOrDrop(true);
      return false;
    }

    if (
      initialRowPhase === DealName.Opportunities &&
      targetRowPhase === DealName.Opportunities
    )
      // Dragging between rows in Opportunities column: ALLOWED
      return true;

    // Can you drag into the target row from the header?
    // If you drag from the header to the opportunities column: ALLOWED
    if (targetRowPhase === DealName.Opportunities && initialRowId === "0")
      return true;
    // If you drag from the header to the proposed column: ALLOWED
    if (targetRowPhase === DealName.Proposed && initialRowId === "0")
      return true;
    // If you drag from opportunities to proposed column: ALLOWED
    if (
      targetRowPhase === DealName.Proposed &&
      initialRowPhase === DealName.Opportunities
    )
      return true;

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
    // If the target is a column
    if (targetId.split("/").length === 1) {
      // If the target is the Opportunities column then return the initialRowId
      if (DealName.Opportunities.toString() === targetId)
        return (targetId = initialRowId);

      // If the initial row is not the same as the target row
      // THEN return a new targetId with the same dealId but the new phase
      if (initialRowId.split("/")[1] !== targetId)
        return (targetId = initialRowId.split("/")[0] + "/" + targetId);
    }

    // If the target is a row
    //   AND dragging to a different column and deal
    //   AND the target column is not Opportunities or Proposed
    else if (
      (targetId.split("/")[1] ?? targetId) !== initialRowId.split("/")[1] &&
      (targetId.split("/")[1] ?? targetId) !== DealName.Opportunities.toString()
    ) {
      return (targetId =
        initialRowId.split("/")[0] + "/" + targetId.split("/")[1]);
    }
    // If the target is a row in Opportunities
    else if (
      (targetId.split("/")[1] ?? targetId) === DealName.Opportunities.toString()
    ) {
      return (targetId = initialRowId);
    }
    // Unhandled edge cases
    return (targetId = initialRowId);
  }

  function updateEmployeeInDB(
    employee: Employee,
    newRowId: string | undefined,
  ) {
    employeeUpdator.mutate({
      employee: {
        employeeId: employee.employeeId,
        rows: employee.rows as string[],
        deals: employee.deals,
      },
      newRowId: newRowId,
    });
  }

  function updateTeamleader(
    groupedDealId: string | undefined,
    phaseName: string | undefined,
    employee: Employee,
    initialPhaseName: string | undefined,
  ) {
    if (
      !groupedDealId ||
      !phaseName ||
      phaseName === DealName.Opportunities.toString()
    ) {
      return;
    }

    // Moving the deal to a different phase (not Opportunities)
    if (
      initialPhaseName &&
      DealName.Opportunities.toString() !== initialPhaseName
    ) {
      moveDeal(groupedDealId, phaseName, employee);
    } else {
      updateOrCreateDeal(groupedDealId, phaseName, employee);
    }
  }
};
