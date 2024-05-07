import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { BoardRow } from "./boardRow";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { DropContext } from "~/contexts/dndProvider";
import { CSS } from "@dnd-kit/utilities";
import DealsColumn from "~/components/teamleader/dealsColumn";
import { useSyncScroll } from "~/hooks/useSyncScroll";
import { FilterMenu } from "../filterMenu";
import { DealContext } from "~/contexts/dealsProvider";
import { X } from "lucide-react";

export function BoardColumn({ columnTitle }: { columnTitle: string }) {
  const { rows, activeColumnId } = useContext(DropContext);
  const {
    isLoading,
    PMId,
    setPMId,
    filteringCurrentRole,
    setFilteringCurrentRole,
    getAllPMs,
  } = useContext(DealContext);
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

  const handlePMPill = () => {
    if (PMId !== "" && PMId !== undefined) {
      const pmName = getAllPMs?.find((pm) => pm.id === PMId)?.first_name;

      return (
        <div className="text-sm flex flex-row gap-1 items-center bg-primary text-white rounded-14 pl-1 pr-0.5">
          <div>{pmName}</div>
          <div className="rounded-full bg-white text-black">
            <X
              size={16}
              onClick={() => {
                localStorage.setItem("PMId", "");
                setPMId("");
              }}
            />
          </div>
        </div>
      );
    }
  };

  const handleRolePill = () => {
    if (filteringCurrentRole !== "" && filteringCurrentRole !== undefined) {
      return (
        <div className="text-sm flex flex-row gap-1 items-center bg-primary text-white rounded-14 pl-1 pr-0.5">
          <div>{filteringCurrentRole}</div>
          <div className="rounded-full bg-white text-black">
            <X
              size={16}
              onClick={() => {
                localStorage.setItem("filteringCurrentRole", "");
                setFilteringCurrentRole("");
              }}
            />
          </div>
        </div>
      );
    }
  };

  const isDeals = columnTitle === "Deals";
  const isMogelijkheden = columnTitle === "Mogelijkheden";
  const isVoorgesteld = columnTitle === "Voorgesteld";
  const isNietWeerhouden = columnTitle === "Niet-Weerhouden";

  // Skeleton for loading state
  if (isLoading ?? !filteredRows ?? filteredRows.length === 0) {
    if (isDeals) {
      return (
        <div className="basis-[24.5rem] bg-secondary rounded-14 animate-pulse px-4 py-2">
          <div className="pb-1.5 text-white">{columnTitle}</div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[3.75rem] bg-primary rounded-14 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      );
    } else if (isMogelijkheden) {
      return (
        <div className="w-[23.5rem] bg-secondary rounded-14 animate-pulse px-4 py-2">
          <div className="pb-1.5 text-white">{columnTitle}</div>
        </div>
      );
    } else {
      return (
        <div className="flex-1 bg-secondary rounded-14 animate-pulse  px-4 py-2">
          <div className="pb-1.5 text-white">
            {isNietWeerhouden ? "Niet Weerhouden" : columnTitle}
          </div>
        </div>
      );
    }
  }

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
      size={isMogelijkheden ? "columnMogelijkheden" : "column"}
    >
      <CardHeader>
        <CardTitle className="pb-1.5 truncate flex justify-between w-full">
          {isNietWeerhouden ? "Niet Weerhouden" : columnTitle}
          {isDeals ? (
            <div className="flex flex-row gap-1">
              {handlePMPill()}
              {handleRolePill()}
              <FilterMenu />
            </div>
          ) : null}
        </CardTitle>
      </CardHeader>
      {isDeals ? (
        <DealsColumn />
      ) : (
        <CardContent className="flex flex-col p-1 gap-2 column no-scrollbar overflow-auto h-[calc(100vh-9.625rem)] w-full">
          <SortableContext items={rowsIds}>
            {filteredRows?.map((row) => <BoardRow key={row.rowId} row={row} />)}
          </SortableContext>
        </CardContent>
      )}
    </Card>
  );
}
