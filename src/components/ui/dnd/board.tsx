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
import { type IItem } from "./item";
import { defaultRows } from "./utils";

interface Sortable {
  // Dit is een sortable type van dnd-kit, puur voor typechecking
  containerId: string;
  index: number;
  items: IItem[];
}

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
    const activeRowIndex =
      Number((active.data.current?.sortable as Sortable).containerId) - 1;
    const overRowIndex =
      Number((over.data.current?.sortable as Sortable).containerId) - 1;

    if (activeItemId === overItemId) return;
    setRows((rows) => {
      const activeItem = rows[activeRowIndex]?.items.find(
        (item) => item.itemID === activeItemId,
      );
      const overItem = rows[activeRowIndex]?.items.find(
        (item) => item.itemID === activeItemId,
      );

      // const updatedRow = {
      //   ...row,
      //   items: arrayMove(
      //     row.items, // items to edit
      //     activeIndexOfItem, // index of the item to move
      //     overIndexOfItem, // index to move to
      //   ),
      // };

      // const rowIndex = rows.findIndex((r) => r.rowID === updatedRow.rowID);
      // const updatedRows = [...rows];
      // updatedRows[rowIndex] = updatedRow;

      // return updatedRows;
      if (activeItem?.itemID !== overItem?.itemID) {
        return arrayMove(rows, activeRowIndex, overRowIndex - 1);
      }

      return arrayMove(rows, activeRowIndex, overRowIndex);
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
          {/* <div /> */}
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
