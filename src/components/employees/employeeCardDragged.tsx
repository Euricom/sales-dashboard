import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { cva } from "class-variance-authority";
import type { EmployeeDragData, EmployeeCardProps } from "~/lib/types";

export function EmployeeCardDragged({
  employee,
  isOverlay,
  isHeader,
}: EmployeeCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: employee.dragItemId,
    data: {
      type: "Employee",
      employee,
    } satisfies EmployeeDragData,
    attributes: {
      roleDescription: "Employee",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
      size={isHeader ? "employee" : "employeeDragged"}
    >
      <Button
        variant={"ghost"}
        {...attributes}
        {...listeners}
        className="w-full h-full"
      >
        {titleToInitials(employee.fields.Title)}
      </Button>
    </Card>
  );
}

const titleToInitials = (title: string) => {
  if (title.split("").length <= 2) return title;

  return title
    .split(" ")
    .map((string) => string[0])
    .join("");
};
