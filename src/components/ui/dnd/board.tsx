import { DndContext } from "@dnd-kit/core";
import { Column } from "~/components/ui/column";
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import Row, { type IRow } from "./row";
import { defaultRows } from "./utils";

// interface Sortable {
//   // Dit is een sortable type van dnd-kit
//   containerId: string;
//   index: number;
//   items: IItem[];
// }

export const Board = () => {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const [rows, setRows] = useState<IRow[]>(defaultRows);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeItemId = active.id;
    const overItemId = over.id;
    if (activeItemId === overItemId) return;

    setRows((rows) => {
      const row = rows.find((row) =>
        row.items?.find((item) => item.itemID === activeItemId),
      );

      if (!row?.items) return rows;

      const activeItem = row.items.find((item) => item.itemID === activeItemId);
      const overItem = row.items.find((item) => item.itemID === overItemId);
      if (!activeItem || !overItem) return rows;

      const activeIndexOfItem = row.items.indexOf(activeItem);
      const overIndexOfItem = row.items.indexOf(overItem);

      const updatedRow = {
        ...row,
        items: arrayMove(
          row.items, // items to edit
          activeIndexOfItem, // index of the item to move
          overIndexOfItem, // index to move to
        ),
      };

      const rowIndex = rows.findIndex((r) => r.rowID === updatedRow.rowID);
      const updatedRows = [...rows];
      updatedRows[rowIndex] = updatedRow;

      return updatedRows;
    });
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeItemId = active.id;
    const overItemId = over.id;

    if (activeItemId === overItemId) return;
    setRows((rows) => {
      // gets the initial and target rows
      const initialRow = rows.find((initialRow) =>
        initialRow.items?.find((item) => item.itemID === activeItemId),
      );
      const targetRow = rows.find((targetRow) =>
        targetRow.items?.find((item) => item.itemID === overItemId),
      );

      if (!initialRow?.items || !targetRow?.items) return rows;

      // gets the initial and target item from their respective rows
      const activeItem = initialRow.items.find(
        (item) => item.itemID === activeItemId,
      );
      const overItem = targetRow.items.find(
        (item) => item.itemID === overItemId,
      );
      if (!activeItem || !overItem) return rows;

      // removes the initial item from the initial row and adds it to the target row
      const initialIndexOfItem = initialRow.items.indexOf(activeItem);
      initialRow.items.splice(initialIndexOfItem, 1);
      // somehow this also adds the item to the correct index, I don't know how (might cause bugs in the future, but for now it works)
      targetRow.items.push(activeItem);

      return rows;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="flex w-full h-full gap-4">
        <Column title="Mogelijkheden" size="columnMogelijkheden">
          {rows.map((row) => {
            return <Row key={row.rowID} rowID={row.rowID} items={row.items} />;
          })}
        </Column>
        <Column title="Voorgesteld">
          <div />
        </Column>
        <Column title="Interview">
          <div />
        </Column>
        <Column title="Weerhouden">
          <div />
        </Column>
        <Column title="Niet Weerhouden">
          <div />
        </Column>
      </div>
    </DndContext>
  );
};
