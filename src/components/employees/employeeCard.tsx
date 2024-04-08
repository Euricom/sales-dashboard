import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { cva } from "class-variance-authority";
import { EmployeeContext } from "~/contexts/employeesProvider";
import { useContext } from "react";
import type { EmployeeCardProps } from "~/lib/types";
import Image from "next/image";
import { DealContext } from "~/contexts/dealsProvider";
import { set } from "zod";

export function EmployeeCardDragged({
  draggableEmployee,
  isOverlay,
  isHeader,
}: EmployeeCardProps) {
  const { employees, employeeId, setEmployeeId } = useContext(EmployeeContext);
  const { setDealIds } = useContext(DealContext);

  const employee = employees.find(
    (employee) =>
      employee.employeeId ===
      (draggableEmployee?.dragId as string)?.split("_")[0],
  )!;

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
      filtering: {
        filtering: "rounded-[18px] border-2 border-primary border-[#00ff00]",
      },
    },
  });

  const onClickAction = () => {
    if (employee.rows[1]) {
      const dealIdsWithoutSuffix = employee.rows.slice(1).map((row) => {
        const dealId = row.toString();
        return dealId.split("/")[0];
      });
      setDealIds(
        dealIdsWithoutSuffix.filter((id) => id !== undefined) as string[],
      );
      setEmployeeId(employee.employeeId);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={
        isHeader && employee.fields.avatar
          ? {
              ...style,
              backgroundImage: `url(data:image/jpeg;base64,${employee.fields.avatar})`,
              backgroundSize: "cover",
            }
          : { ...style }
      }
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        filtering:
          employee.employeeId === employeeId && isHeader
            ? "filtering"
            : undefined,
      })}
      size={isHeader ? "employee" : "employeeDragged"}
      onClick={() => {
        onClickAction();
      }}
    >
      <Button
        variant={"ghost"}
        {...attributes}
        {...listeners}
        className="w-full h-full relative"
      >
        {isHeader ? null : (
          <div className="absolute top-[5px] w-full rounded-2xl flex flex-row">
            <Image
              src={`data:image/jpeg;base64,${employee.fields.avatar}`}
              alt={employee.fields.Title}
              className="ml-2 object-cover rounded-full"
              width={30}
              height={30}
            />
          </div>
        )}
        <div className="absolute bottom-0 bg-white/75 text-black w-full rounded-b-2xl">
          {titleToInitials(employee.fields.Title)}
        </div>
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
