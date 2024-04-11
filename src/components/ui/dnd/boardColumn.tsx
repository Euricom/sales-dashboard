import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { BoardRow } from "./boardRow";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { DropContext } from "~/contexts/dndProvider";
import { CSS } from "@dnd-kit/utilities";
import DealsColumn from "~/components/teamleader/dealsColumn";
import { useSyncScroll } from "~/hooks/useSyncScroll";

export function BoardColumn({ columnTitle }: { columnTitle: string }) {
  const { rows, activeColumnId } = useContext(DropContext);
  const filteredRows = rows
    .filter((row) => row.rowId !== "0")
    .filter((row) => row.rowId.split("/")[1] === columnTitle);
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
    id: columnTitle,
    data: {
      type: "Column",
      filteredRows,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const isDeals = columnTitle === "Deals";
  const isMogelijkheden = columnTitle === "Mogelijkheden";
  const isVoorgesteld = columnTitle === "Voorgesteld";
  const isNietWeerhouden = columnTitle === "Niet-Weerhouden";

  if (!filteredRows || (filteredRows.length === 0 && !isDeals)) return null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant={
        activeColumnId === columnTitle &&
        !isMogelijkheden &&
        !isDeals &&
        !isVoorgesteld
          ? "columnHighlight"
          : "column"
      }
      size={isMogelijkheden || isVoorgesteld ? "columnMogelijkheden" : "column"}
    >
      <CardHeader className="pb-1.5 truncate w-full">
        <CardTitle>
          {isNietWeerhouden ? "Niet Weerhouden" : columnTitle}
        </CardTitle>
      </CardHeader>
      {isDeals ? (
        <DealsColumn />
      ) : (
        <CardContent className="flex flex-col gap-2 column no-scrollbar overflow-auto h-[calc(100vh-9.625rem)]">
          <SortableContext items={rowsIds}>
            {filteredRows?.map((row) => <BoardRow key={row.rowId} row={row} />)}
          </SortableContext>
        </CardContent>
      )}
    </Card>
  );
}
