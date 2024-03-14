import { useSortable } from "@dnd-kit/sortable";
import type { FC } from "react";
import { CSS } from "@dnd-kit/utilities";
import { EmployeeCardDragged } from "~/components/employees/employeeCard";
import { type UniqueIdentifier } from "@dnd-kit/core";

export interface IItem {
  itemID: UniqueIdentifier;
  rowID: UniqueIdentifier;
  content: string;
}

const Item: FC<IItem> = ({ itemID, content }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: itemID,
    });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      <EmployeeCardDragged content={content} />
    </div>
  );
};

export default Item;
