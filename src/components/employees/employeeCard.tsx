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
  const { setDealIds, getCorrectDealId, deals, updateDealProbability } =
    useContext(DealContext);
  const [filteringVariant, setFilteringVariant] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  const [childLocation, setChildLocation] = useState({ top: 0, left: 0 });
  const [correctDealInfo, setCorrectDealInfo] = useState<SimplifiedDeal>();
  const [TLDatum, setTLDatum] = useState<Date | null>(null);
  const [mongoDatum, setMongoDatum] = useState<Date | null>(null);

  const phase = (draggableEmployee.dragId as string).split("/")[1];

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

      const empDeal = employee.deals.find(
        (deal) => deal.dealId === correctDealId,
      );
      setTLDatum(
        correctDealInfo?.updated_at
          ? new Date(correctDealInfo?.updated_at)
          : null,
      );
      setMongoDatum(empDeal?.datum ?? null);
    }
  }, [
    employee,
    deals,
    draggableEmployee.dragId,
    getCorrectDealId,
    isHeader,
    correctDealInfo?.updated_at,
  ]);

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
      localStorage.setItem("dealIds", JSON.stringify(dealIdsWithoutSuffix));
      localStorage.setItem("employeeId", employee.employeeId);

      setDealIds(
        dealIdsWithoutSuffix.filter((id) => id !== undefined) as string[],
      );
      setEmployeeId(employee.employeeId);
      setFiltering(true);
      return;
    } else if (!isFilterPossible) {
      handleFilterNotPossible();
    }
    localStorage.setItem("dealIds", JSON.stringify([]));
    localStorage.setItem("employeeId", "");
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
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const detailViewHeight = 140;
    const detailViewWidth = 315; // Assuming the detail view is also 140px wide
    // Get position relative to the document
    const rect = clickedElement.getBoundingClientRect();
    let top = rect.top + window.scrollY;
    let left = rect.left + window.scrollX + clickedElementWidth;

    if (rect.bottom + detailViewHeight > windowHeight) {
      top = top - detailViewHeight;
    }

    if (rect.right + detailViewWidth > windowWidth) {
      left = rect.left + window.scrollX - detailViewWidth;
    }

    const positionRelativeToDocument = {
      top: top,
      left: left,
    };
    setChildLocation(positionRelativeToDocument);

    if (currentEmployeeDetailsId === draggableEmployee.dragId) {
      setCurrentEmployeeDetailsId("");
      setShowDetailView(false);
      return;
    }
    setCurrentEmployeeDetailsId(draggableEmployee.dragId as string);
  };

  const handleProbabilityPicker = (
    e: React.MouseEvent<HTMLButtonElement>,
    probability: number,
  ) => {
    if (!correctDealInfo || (isHeader && phase !== "Mogelijkheden")) return;
    updateDealProbability(correctDealInfo?.id, probability);
    // instead of refetch
    correctDealInfo.estimated_probability = probability / 100;
  };

  const weeksLeft = () => {
    if (employee.weeksLeft === -1)
      return {
        time: -1,
        color: "white",
      };

    return {
      time: Math.abs(employee.weeksLeft),
      color: employee.weeksLeft > 0 ? "green" : "red",
    };
  };

  const employeeDate = () => {
    const phase = (draggableEmployee.dragId as string).split("/")[1];
    if (phase === "Mogelijkheden") return "No Date";
    if (TLDatum) {
      return TLDatum.toLocaleDateString("fr-BE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else if (mongoDatum) {
      return mongoDatum.toLocaleDateString("fr-BE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else {
      return "No Date";
    }
  };

  const weeksLeftData = weeksLeft();
  const bgColorClass =
    weeksLeftData?.color === "green" ? "bg-green-500" : "bg-red-500";

  if (isHeader) {
    return (
      <Card
        ref={setNodeRef}
        style={{
          ...style,
          backgroundImage: `url(data:image/jpeg;base64,${employee.fields.avatar})`,
          backgroundSize: "cover",
          backgroundColor: colors?.backgroundColor,
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
            className={`${bgColorClass} absolute top-0 -right-[0.375rem] flex justify-center items-center min-w-[1.25rem] h-[1.25rem] rounded-bl-[0.3rem] px-0.5 rounded-r-[0.3rem] font-normal text-white`}
          >
            {weeksLeftData?.time}
          </div>
          <div
            className="absolute z-10 bottom-0 w-full rounded-b-14 px-1.5 font-normal"
            style={{
              backgroundColor: colors?.backgroundColor,
              color: colors?.color,
            }}
          >
            {truncateName(firstNameOnly(employee.fields.Title)!)}
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
                src={
                  employee.fields.avatar && employee.employeeId !== "108"
                    ? `data:image/jpeg;base64,${employee.fields.avatar}`
                    : "https://cdn3.iconfinder.com/data/icons/feather-5/24/user-512.png"
                }
                alt={employee.fields.Title}
                className="object-cover rounded-14 border-2"
                width={30}
                height={30}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                  borderColor: colors?.backgroundColor,
                  backgroundColor: colors?.backgroundColor,
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
            {employeeDate()}
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
                <h1>{employee.fields.Title}</h1>
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
              {phase !== "Mogelijkheden" && (
                <>
                  <div className="h-0.5 bg-primary rounded-full" />

                  <div>
                    <div className="mb-2">
                      <p className="font-light">Slaagkans (%)</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant={"probabilityPicker"}
                        size={"sm"}
                        className="bg-[#ff0000]"
                        onClick={(e) => handleProbabilityPicker(e, 0)}
                      >
                        0
                      </Button>
                      <Button
                        variant={"probabilityPicker"}
                        size={"sm"}
                        className="bg-[#ff5000]"
                        onClick={(e) => handleProbabilityPicker(e, 20)}
                      >
                        20
                      </Button>
                      <Button
                        variant={"probabilityPicker"}
                        size={"sm"}
                        className="bg-[#fea600]"
                        onClick={(e) => handleProbabilityPicker(e, 40)}
                      >
                        40
                      </Button>
                      <Button
                        variant={"probabilityPicker"}
                        size={"sm"}
                        className="bg-[#fdc800] text-primary hover:text-white focus:text-white"
                        onClick={(e) => handleProbabilityPicker(e, 60)}
                      >
                        60
                      </Button>
                      <Button
                        variant={"probabilityPicker"}
                        size={"sm"}
                        className="bg-[#b4fa00] text-primary hover:text-white focus:text-white"
                        onClick={(e) => handleProbabilityPicker(e, 80)}
                      >
                        80
                      </Button>
                      <Button
                        variant={"probabilityPicker"}
                        size={"sm"}
                        className="bg-[#00ff00] text-primary hover:text-white focus:text-white"
                        onClick={(e) => handleProbabilityPicker(e, 100)}
                      >
                        100
                      </Button>
                    </div>
                  </div>
                </>
              )}
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

const truncateName = (name: string) => {
  const MAX_NAME_LENGTH = 4;
  if (name.length > MAX_NAME_LENGTH) {
    return name.slice(0, MAX_NAME_LENGTH) + ".";
  } else {
    return name;
  }
};
