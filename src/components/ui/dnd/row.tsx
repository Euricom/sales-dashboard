import { type UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import type { FC } from "react";
import Item, { type IItem } from "./item";

// De reden voor IRow is dat we meer properties nodig zullen hebben dan mogelijk in een Sortable van dnd-kit
// Dus een Row is een container van items, en dus ook een Sortable maar met extra properties

export interface IRow {
  rowID: UniqueIdentifier;
  items: IItem[];
  //extra properties kunnen hier
}

const Row: FC<IRow> = ({ rowID, items }) => {
  const { setNodeRef } = useDroppable({ id: rowID });

  return (
    <>
      {/* Dit is een SortableContext en heeft een Sortable type */}
      <SortableContext
        id={rowID.toString()}
        items={items.map((item) => item?.itemID)}
      >
        <div ref={setNodeRef} className="flex h-fit min-h-16 gap-4">
          {items.map((item) =>
            !item ? null : (
              <Item
                key={item?.itemID}
                itemID={item?.itemID}
                rowID={item?.rowID}
                content={item?.content}
              />
            ),
          )}
        </div>
      </SortableContext>
    </>
  );
};

export default Row;
