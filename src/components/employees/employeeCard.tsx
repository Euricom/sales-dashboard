import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cva } from "class-variance-authority";
import { EmployeeContext } from "~/contexts/employeesProvider";
import { useContext, useEffect, useState } from "react";
import type { EmployeeCardProps } from "~/lib/types";
import Image from "next/image";
import { DealContext } from "~/contexts/dealsProvider";
import { determineColors } from "~/lib/utils";
import { Briefcase, Home, X } from "lucide-react";

export function EmployeeCardDragged({
  draggableEmployee,
  isOverlay,
  isHeader,
}: EmployeeCardProps) {
  const {
    employees,
    employeeId,
    setEmployeeId,
    setFiltering,
    currentEmployeeDetailsId,
    setCurrentEmployeeDetailsId,
  } = useContext(EmployeeContext);
  const { setDealIds } = useContext(DealContext);
  const [filteringVariant, setFilteringVariant] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  const [childLocation, setChildLocation] = useState({ top: 0, left: 0 });

  const employee = employees.find(
    (employee) =>
      employee.employeeId ===
      (draggableEmployee?.dragId as string)?.split("_")[0],
  );
  const isFilterPossible = !(employee?.rows.length === 1);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    // transition,
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
    transition: `.05s ease-in-out`,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
      filtering: {
        filtering: "outline outline-[#00ff00]",
        noFilterPossible: "outline outline-red-500",
      },
      position: {
        clicked: "z-30",
      },
    },
  });

  useEffect(() => {
    if (currentEmployeeDetailsId === draggableEmployee.dragId) {
      setShowDetailView(true);
    } else {
      setShowDetailView(false);
    }
  }, [currentEmployeeDetailsId, draggableEmployee.dragId]);

  if (!employee) return null;

  const handleOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isHeader) {
      handleFilter();
    } else {
      handleDetailView(event);
    }
  };

  const handleFilter = () => {
    if (isFilterPossible && employeeId !== employee.employeeId) {
      const dealIdsWithoutSuffix = employee.rows.slice(1).map((row) => {
        const dealId = String(row);
        return dealId.split("/")[0];
      });
      setDealIds(
        dealIdsWithoutSuffix.filter((id) => id !== undefined) as string[],
      );
      setEmployeeId(employee.employeeId);
      setFiltering(true);
      return;
    } else if (!isFilterPossible) {
      handleFilterNotPossible();
    }
    setDealIds([]);
    setEmployeeId("");
    setFiltering(false);
  };

  const handleFilterNotPossible = () => {
    setFilteringVariant("noFilterPossible");
    setTimeout(() => {
      setFilteringVariant("");
    }, 750);
  };

  const handleDetailView = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedElement = event.currentTarget;
    const clickedElementWidth = clickedElement.offsetWidth;

    // Get position relative to the document
    const rect = clickedElement.getBoundingClientRect();
    const positionRelativeToDocument = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX + clickedElementWidth,
    };

    setChildLocation(positionRelativeToDocument);

    if (currentEmployeeDetailsId === draggableEmployee.dragId) {
      setCurrentEmployeeDetailsId("");
      setShowDetailView(false);
      return;
    }
    setCurrentEmployeeDetailsId(draggableEmployee.dragId as string);
  };

  const colors = determineColors(employee.fields.Job_x0020_title);

  if (isHeader) {
    return (
      <Card
        ref={setNodeRef}
        style={{
          ...style,
          backgroundImage: `url(data:image/jpeg;base64,${employee.fields.avatar})`,
          backgroundSize: "cover",
        }}
        className={variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
          filtering:
            employee.employeeId === employeeId
              ? "filtering"
              : (filteringVariant as "noFilterPossible" | null),
        })}
        size={"employee"}
        onClick={handleOnClick}
      >
        <Button
          variant="ghost"
          size={"default"}
          {...attributes}
          {...listeners}
          className="w-full h-full relative"
        >
          <div
            className="absolute z-10 bottom-0 w-full rounded-b-14 truncate px-1.5 font-normal"
            style={{
              backgroundColor: colors?.backgroundColor,
              color: colors?.color,
            }}
          >
            {firstNameOnly(employee.fields.Title)}
          </div>
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
          position: showDetailView ? "clicked" : undefined,
        })}
        size="employeeDragged"
        onClick={handleOnClick}
      >
        <Button
          variant="ghost"
          size="dragged"
          {...attributes}
          {...listeners}
          className="w-full h-full hover:text-white flex flex-col justify-between p-0"
        >
          <div className="w-full flex flex-row justify-between mt-1 px-2">
            <div className="flex w-7 h-7 justify-between">
              <Image
                src={`data:image/jpeg;base64,${employee.fields.avatar}`}
                alt={employee.fields.Title}
                className="object-cover rounded-14 border-2"
                width={30}
                height={30}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                  borderColor: colors?.backgroundColor,
                }}
              />
            </div>
          </div>
          <div className=" w-full rounded-b-14 truncate text-xs font-normal py-1">
            01/01/2022
          </div>
        </Button>
        {showDetailView && (
          <Card
            className="left-[5.5rem] top-0 h-fit z-100 bg-white text-primary fixed"
            style={{ top: childLocation.top, left: childLocation.left + 8 }}
          >
            <CardContent className="flex flex-col gap-1">
              <div className="flex justify-between gap-8">
                <h1>{firstNameOnly(employee.fields.Title)}</h1>
                <X width={20} className="cursor-pointer" />
              </div>
              <div className="h-0.5 bg-primary rounded-full" />
              <div className="flex gap-2">
                <Briefcase width={20} />
                <p className="font-light text-nowrap">
                  {employee.fields.Job_x0020_title}
                </p>
              </div>
              <div className="flex gap-2">
                <Home width={20} />
                <p className="font-light text-nowrap">{employee.fields.City}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </Card>
    </>
  );
}

const firstNameOnly = (name: string) => {
  return name.split(" ")[0];
};
