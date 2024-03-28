import { useContext, useMemo } from "react";
import { BoardRow } from "./boardRow";
import { SortableContext } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { DropContext } from "~/contexts/dndProvider";

export function BoardColumn({ columnTitle }: { columnTitle: string }) {
  const { rows } = useContext(DropContext);
  const filteredRows = rows
    .filter((row) => row.rowId !== "0")
    .filter((row) => row.rowId.split("/")[1] === columnTitle);
  const rowsIds = useMemo(
    () => filteredRows.map((row) => row.rowId),
    [filteredRows],
  );

  if (!filteredRows || filteredRows.length === 0) return null;

  return (
    <Card
      variant={"column"}
      size={columnTitle === "Mogelijkheden" ? "columnMogelijkheden" : "column"}
    >
      <CardHeader className="pb-1.5">
        <CardTitle>
          {columnTitle === "Niet-Weerhouden" ? "Niet Weerhouden" : columnTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <SortableContext items={rowsIds}>
          {filteredRows?.map((row) => <BoardRow key={row.rowId} row={row} />)}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
