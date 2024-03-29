import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { cva } from "class-variance-authority";
import type { EmployeeCardProps } from "~/lib/types";
import { EmployeeContext } from "~/contexts/employeesProvider";
import { useContext } from "react";

export function EmployeeCardDragged({
  draggableEmployee,
  isOverlay,
  isHeader,
}: EmployeeCardProps) {
  const { employees } = useContext(EmployeeContext);

  const employee = employees.find(
    (employee) =>
      employee.employeeId ===
      (draggableEmployee?.dragId as string)?.split("_")[0],
  );

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: draggableEmployee.dragId,
    data: {
      type: "Employee",
      employee: employee,
      dragId: draggableEmployee.dragId,
    },
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
        {titleToInitials(employee?.fields.Title)}
      </Button>
    </Card>
  );
}

const titleToInitials = (title?: string) => {
  if (!title) return "N/A";
  if (title.split("").length <= 2) return title;

  return title
    .split(" ")
    .map((string) => string[0])
    .join("");
};
