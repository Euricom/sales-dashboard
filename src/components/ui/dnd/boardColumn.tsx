import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { BoardRow } from "./boardRow";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { DropContext } from "~/contexts/dndProvider";
import { CSS } from "@dnd-kit/utilities";
import { useSyncScroll } from "~/hooks/useSyncScroll";
import { DealContext } from "~/contexts/dealsProvider";
import { DealName, type DealPhase } from "~/lib/types";

export function BoardColumn({ dealPhase }: { dealPhase: DealPhase }) {
  const { rows, activeColumnId } = useContext(DropContext);
  const { isLoading } = useContext(DealContext);
  const filteredRows = rows
    .filter((row) => row.rowId !== "0")
    .filter((row) => row.rowId.split("/")[1] === dealPhase.name);
  const rowsIds = useMemo(
    () => filteredRows.map((row) => row.rowId),
    [filteredRows],
  );

  // this is for the scroll functionality
  const columnsRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const [columns, setColumns] = useState<NodeListOf<HTMLDivElement> | null>(
    null,
  );

  useEffect(() => {
    // Function to update columnsRef and columns state variable
    const updateColumns = () => {
      const newColumns: NodeListOf<HTMLDivElement> =
        document.querySelectorAll(".column");
      columnsRef.current = newColumns;
      setColumns(newColumns);
    };

    // Initial update
    updateColumns();

    // Listen for DOM changes and update columns
    const observer = new MutationObserver(updateColumns);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      observer.disconnect(); // Clean up the observer
    };
  }, []);

  // Call useSyncScroll hook with columns
  useSyncScroll(columns);

  const { setNodeRef, transform, transition } = useSortable({
    id: dealPhase.label,
    data: {
      type: "Column",
      filteredRows,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const isOpportunity = dealPhase.name === DealName.Opportunities;
  const isProposed = dealPhase.name === DealName.Proposed;

  // Skeleton for loading state
  if (isLoading ?? !filteredRows ?? filteredRows.length === 0) {
    if (isOpportunity) {
      return (
        <div className="w-[23.5rem] bg-secondary rounded-14 animate-pulse px-4 py-2">
          <div className="pb-1.5 text-white">{dealPhase.label}</div>
        </div>
      );
    } else {
      return (
        <div className="flex-1 bg-secondary rounded-14 animate-pulse  px-4 py-2">
          <div className="pb-1.5 text-white">{dealPhase.label}</div>
        </div>
      );
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant={
        activeColumnId === dealPhase.name && !isOpportunity && !isProposed
          ? "columnHighlight"
          : "column"
      }
      size={
        isOpportunity || isProposed
          ? "columnOpportunitiesAndProposed"
          : "column"
      }
    >
      <CardHeader>
        <CardTitle className="pb-1.5 truncate flex justify-between w-full">
          {dealPhase.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col p-1 gap-2 column no-scrollbar overflow-auto h-[calc(100vh-9.625rem)] w-full">
        <SortableContext items={rowsIds}>
          {filteredRows?.map((row) => <BoardRow key={row.rowId} row={row} />)}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
