import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useContext, useEffect, useMemo, useState } from "react";
import { EmployeeCardDragged } from "../../employees/employeeCard";
import { Card, CardContent } from "../card";
import { DealName, type BoardRowProps, type DraggableEmployee } from "~/lib/types";
import { DropContext } from "~/contexts/dndProvider";
import { EmployeeContext } from "~/contexts/employeesProvider";
import { log } from "console";

export function BoardRow({ row, isHeader, rowStatus }: BoardRowProps) {
  const {
    activeDealId,
    activeColumnId,
    groupedDealsToWrap,
    appendGroupedDeal,
    removeGroupedDeal,
  } = useContext(DropContext);
  const { draggableEmployees, isFiltering } = useContext(EmployeeContext);

  const draggableEmployeesInThisRow: DraggableEmployee[] = useMemo(() => {
    return draggableEmployees
      .filter((draggableEmployee) => {
        const rowId = (draggableEmployee.dragId as string).split("_")[1];
        const status = (draggableEmployee.dragId as string).split("_")[2];

        if (!isHeader && !status) {
          return rowId === row.rowId.split("_")[0];
        }
        return rowId === "0" && status === rowStatus;
      })
      .sort((a, b) => {
        return a.weeksLeft - b.weeksLeft;
      });
  }, [draggableEmployees, row.rowId, isHeader, rowStatus]);

  const dragItemIds = draggableEmployeesInThisRow.map(
    (draggableEmployee) => draggableEmployee.dragId,
  );
  const isOpportunities = activeColumnId === DealName.Opportunities;
  const isProposed = activeColumnId === DealName.Proposed;

  const variant =
    row.rowId === activeDealId &&
    !isHeader &&
    (isOpportunities || isProposed)
      ? "rowhighlight"
      : "row";

  const { setNodeRef, transform, transition, node } = useSortable({
    id: rowStatus ? `${row.rowId}_${rowStatus}` : row.rowId,
    data: {
      type: "Row",
      row,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  // Check if the content is wrapping and if so, add the groupedDealId to list
  const [shouldWrap, setShouldWrap] = useState(false);
  useEffect(() => {
    const cardElement = node.current as unknown as HTMLElement;
    if (cardElement) {
      const isWrapping = cardElement.scrollHeight > cardElement.clientHeight;
      const groupedDealId = row.rowId.split("/")[0];
      if (groupedDealId && !isHeader) {
        if (isWrapping && !groupedDealsToWrap.includes(groupedDealId)) {
          // Content is wrapping AKA too many employees in this row
          appendGroupedDeal(groupedDealId);
        } else if (!isWrapping && groupedDealsToWrap.includes(groupedDealId)) {
          const isNotWrappingAnymore =
            cardElement.scrollHeight < cardElement.clientHeight;
          if (isNotWrappingAnymore) {
            // Content is not wrapping anymore and should be unwrapped
            removeGroupedDeal(groupedDealId);
          }
          // cardElement.scrollHeight = cardElement.clientHeight --> size should stay the same
        }
      }
    }
  }, [dragItemIds]);

  // Check if the content should wrap based on groupedDealsToWrap
  useEffect(() => {
    if (!isHeader) {
      const groupedDealId = row.rowId.split("/")[0];
      if (groupedDealId) {
        if (groupedDealsToWrap.includes(groupedDealId))
          setShouldWrap(groupedDealsToWrap.includes(groupedDealId));
      }
    }
  }, [groupedDealsToWrap]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant={variant}
      size={"row"}
      className={`${shouldWrap ? "min-h-32" : ""}`}
    >
      <CardContent
        className={`flex gap-2 h-15 ${isHeader ? "gap-4" : shouldWrap ? "flex-wrap min-h-32 overflow-hidden" : "flex-wrap"}`}
      >
        <SortableContext
          items={dragItemIds}
          id={row.rowId}
          disabled={isFiltering && isHeader}
        >
          {draggableEmployeesInThisRow?.map((e) => (
            <EmployeeCardDragged
              key={e.dragId}
              draggableEmployee={e}
              isHeader={isHeader}
            />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
