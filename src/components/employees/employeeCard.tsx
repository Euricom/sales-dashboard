import { useSortable } from "@dnd-kit/sortable";
import { CSS, getWindow } from "@dnd-kit/utilities";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cva } from "class-variance-authority";
import { EmployeeContext } from "~/contexts/employeesProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import type { EmployeeCardProps } from "~/lib/types";
import Image from "next/image";
import { DealContext } from "~/contexts/dealsProvider";
import { determineColors } from "~/lib/utils";
import { Briefcase, Home, X } from "lucide-react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";

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
  const { setDealIds, getCorrectDealId, deals } = useContext(DealContext);
  const [filteringVariant, setFilteringVariant] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  const [childLocation, setChildLocation] = useState({ top: 0, left: 0 });
  const [correctDealInfo, setCorrectDealInfo] = useState<SimplifiedDeal>();

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

  // Show detail view when clicked
  useEffect(() => {
    if (currentEmployeeDetailsId === draggableEmployee.dragId) {
      setShowDetailView(true);
    } else {
      setShowDetailView(false);
    }
  }, [currentEmployeeDetailsId, draggableEmployee.dragId]);

  // Get correct deal info for employee
  useEffect(() => {
    if (!isHeader) {
      const groupedDealId = (draggableEmployee.dragId as string)
        .split("_")[1]
        ?.split("/")?.[0];
      if (!groupedDealId || !employee) return;
      const correctDealId = getCorrectDealId(groupedDealId, employee);
      setCorrectDealInfo(deals?.find((deal) => deal.id === correctDealId));
    }
  }, [employee, deals, draggableEmployee.dragId, getCorrectDealId, isHeader]);

  // Close detail view when dragging or scrolling
  useEffect(() => {
    setShowDetailView(false);
  }, [isDragging]);

  if (!employee) return null;
  const colors = determineColors(employee.fields.Job_x0020_title);

  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  const handleDetailView = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  const handleProcentPicker = (
    e: React.MouseEvent<HTMLButtonElement>,
    procent: number,
  ) => {
    console.log(procent);
  };

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
      >
        <Button
          variant="ghost"
          size={"default"}
          {...attributes}
          {...listeners}
          className="w-full h-full relative"
          onClick={handleOnClick}
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
      >
        <Button
          variant="ghost"
          size="dragged"
          {...attributes}
          {...listeners}
          className="w-full h-full hover:text-white flex flex-col justify-between p-0"
          onClick={handleOnClick}
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
            <div className="w-7 h-7">
              <CircularProgressbarWithChildren
                value={
                  correctDealInfo?.estimated_probability
                    ? Number(correctDealInfo?.estimated_probability * 100)
                    : 0
                }
                strokeWidth={8}
                styles={buildStyles({
                  strokeLinecap: "butt",
                  pathColor: "#00C800",
                  trailColor: "#FFFFFF",
                })}
                className="shadow-[inset_0_3px_10px_rgba(0,0,0,.6)] rounded-full"
              >
                <div className="mt-[1px] text-xs">
                  {correctDealInfo?.estimated_probability ? (
                    Number(correctDealInfo?.estimated_probability * 100)
                  ) : (
                    <div className="text-[9px]">N/A</div>
                  )}
                </div>
              </CircularProgressbarWithChildren>
            </div>
          </div>
          <div className=" w-full rounded-b-14 truncate text-[11px] font-normal py-1">
            {correctDealInfo?.estimated_closing_date === ""
              ? "no date"
              : correctDealInfo?.estimated_closing_date}
          </div>
        </Button>
        {showDetailView && (
          <Card
            className="left-[5.5rem] top-0 h-fit z-100 bg-white text-primary fixed"
            style={{
              top: childLocation.top,
              left: childLocation.left + 8,
            }}
          >
            <CardContent className="flex flex-col gap-2">
              <div className="flex justify-between gap-8 h-fit">
                <h1>{firstNameOnly(employee.fields.Title)}</h1>
                <Button variant={"icon"} size={"clear"} onClick={handleOnClick}>
                  <X width={20} className="cursor-pointer" />
                </Button>
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
              <div className="h-0.5 bg-primary rounded-full" />
              <div>
                <div className="mb-2">
                  <p className="font-light">Percentage</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={"percentagePicker"}
                    size={"sm"}
                    className="bg-[#ff0000]"
                    onClick={(e) => handleProcentPicker(e, 0)}
                  >
                    0
                  </Button>
                  <Button
                    variant={"percentagePicker"}
                    size={"sm"}
                    className="bg-[#ff5000]"
                    onClick={(e) => handleProcentPicker(e, 20)}
                  >
                    20
                  </Button>
                  <Button
                    variant={"percentagePicker"}
                    size={"sm"}
                    className="bg-[#fea600]"
                    onClick={(e) => handleProcentPicker(e, 40)}
                  >
                    40
                  </Button>
                  <Button
                    variant={"percentagePicker"}
                    size={"sm"}
                    className="bg-[#fdc800] text-primary hover:text-white focus:text-white"
                    onClick={(e) => handleProcentPicker(e, 60)}
                  >
                    60
                  </Button>
                  <Button
                    variant={"percentagePicker"}
                    size={"sm"}
                    className="bg-[#b4fa00] text-primary hover:text-white focus:text-white"
                    onClick={(e) => handleProcentPicker(e, 80)}
                  >
                    80
                  </Button>
                  <Button
                    variant={"percentagePicker"}
                    size={"sm"}
                    className="bg-[#00ff00] text-primary hover:text-white focus:text-white"
                    onClick={(e) => handleProcentPicker(e, 100)}
                  >
                    100
                  </Button>
                </div>
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
