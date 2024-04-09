import { useContext, useMemo } from "react";
import { BoardRow } from "./boardRow";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { DropContext } from "~/contexts/dndProvider";
import { CSS } from "@dnd-kit/utilities";
import DealsColumn from "~/components/teamleader/dealsColumn";

export function BoardColumn({ columnTitle }: { columnTitle: string }) {
  const { rows, activeColumnId } = useContext(DropContext);
  const filteredRows = rows
    .filter((row) => row.rowId !== "0")
    .filter((row) => row.rowId.split("/")[1] === columnTitle);
  const rowsIds = useMemo(
    () => filteredRows.map((row) => row.rowId),
    [filteredRows],
  );

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
  const isNietWeerhouden = columnTitle === "Niet-Weerhouden";

  if (!filteredRows || (filteredRows.length === 0 && !isDeals)) return null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant={
        activeColumnId === columnTitle && !isMogelijkheden && !isDeals
          ? "columnHighlight"
          : "column"
      }
      size={isMogelijkheden ? "columnMogelijkheden" : "column"}
      className={
        activeColumnId && isDeals ? "outline-red-500 outline outline-2 " : ""
      }
    >
      <CardHeader className="pb-1.5 truncate w-full">
        <CardTitle>
          {isNietWeerhouden ? "Niet Weerhouden" : columnTitle}
        </CardTitle>
      </CardHeader>
      {isDeals ? (
        <DealsColumn isDeals={activeColumnId === "Deals" ? true : false} />
      ) : (
        <CardContent className="flex flex-col gap-2">
          <SortableContext items={rowsIds}>
            {filteredRows?.map((row) => <BoardRow key={row.rowId} row={row} />)}
          </SortableContext>
        </CardContent>
      )}
    </Card>
  );
}
