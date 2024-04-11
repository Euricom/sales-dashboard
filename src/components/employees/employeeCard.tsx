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
      filtering: {
        filtering: "rounded-[18px] border-2 border-primary border-[#00ff00]",
      },
    },
  });

  if (!employee) return null;

  const onClickAction = () => {
    if (employee.rows[1]) {
      const dealIdsWithoutSuffix = employee.rows.slice(1).map((row) => {
        const dealId = String(row);
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
          <div className="absolute top-[5px] w-full flex flex-row">
            <div
              style={{ width: "1.875rem", height: "1.875rem", display: "flex" }}
            >
              <Image
                src={`data:image/jpeg;base64,${employee.fields.avatar}`}
                alt={employee.fields.Title}
                className="ml-2 object-cover rounded-14"
                width={30}
                height={30}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 bg-white/75 text-black w-full rounded-b-14 truncate px-1.5">
          {firstNameOnly(employee.fields.Title)}
        </div>
      </Button>
    </Card>
  );
}

const firstNameOnly = (name: string) => {
  return name.split(" ")[0];
};
