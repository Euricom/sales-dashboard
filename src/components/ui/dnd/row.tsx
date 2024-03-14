import { useDroppable, type UniqueIdentifier } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
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

  // console.log(rowID);
  return (
    <div ref={setNodeRef} className="flex h-fit min-h-16 gap-4 w-full">
      {/* Dit is een SortableContext en heeft een Sortable type */}
      <SortableContext
        id={rowID.toString()}
        items={items.map((item) => item?.itemID)}
        strategy={horizontalListSortingStrategy}
      >
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
      </SortableContext>
    </div>
  );
};

export default Row;
