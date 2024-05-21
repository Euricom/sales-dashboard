import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cva } from "class-variance-authority";
import { EmployeeContext } from "~/contexts/employeesProvider";
import { useContext, useEffect, useRef, useState } from "react";
import { DealName, type EmployeeCardProps } from "~/lib/types";
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
import { DatePickerComponent } from "../ui/datePicker";
import { ProbabilityPicker } from "../ui/probabilityPicker";
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

      if (correctDealInfo && employee) {
        const lastIndex = correctDealInfo.phase_history.length - 1;
        // needs better name but i don't know which date it is
        const lastDate = correctDealInfo.phase_history[lastIndex];
        if (lastDate) {
          const datum = new Date(lastDate.started_at);
          if (!TLDatum) {
            // only set TLDatum if it hasn't been set yet
            setTLDatum(new Date(datum));
          }
        }
      }

      setMongoDatum(empDeal?.datum ?? null);
    }
  }, [
    employee,
    deals,
    draggableEmployee.dragId,
    getCorrectDealId,
    isHeader,
    correctDealInfo,
  ]);

  // Close detail view when dragging or scrolling
  useEffect(() => {
    setShowDetailView(false);
  }, [isDragging]);

  // Close detail view when clicking outside
  const detailViewRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Add mousedown event listener to document
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Check if the clicked element is outside of the detail view card
      if (
        detailViewRef.current &&
        !detailViewRef.current.contains(event.target as Node) &&
        !dateRef.current?.contains(event.target as Node)
      ) {
        // Close the detail view
        setCurrentEmployeeDetailsId("");
        setShowDetailView(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [setCurrentEmployeeDetailsId]);

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

  const handleProbabilityPicker = (probability: number) => {
    if (!correctDealInfo || (isHeader && phase !== DealName.Opportunities))
      return;
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
    if (phase === DealName.Opportunities) return "No Date";
    if (TLDatum) {
      return TLDatum.toLocaleDateString("fr-BE", {
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

  const handleDateChange = (date: Date) => {
    setTLDatum(date);
  };

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
        title={employee.fields.Title}
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

  const employeeEstProbability = correctDealInfo?.estimated_probability
    ? Number(correctDealInfo?.estimated_probability * 100)
    : 0;

  const pathColor = () => {
    if (employeeEstProbability < 20) return "#ff0000";
    if (employeeEstProbability < 40) return "#ff5000";
    if (employeeEstProbability < 60) return "#fea600";
    if (employeeEstProbability < 80) return "#fdc800";
    if (employeeEstProbability < 90) return "#b4fa00";
    return "#00ff00";
  };

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
                value={employeeEstProbability}
                strokeWidth={8}
                styles={buildStyles({
                  strokeLinecap: "butt",
                  pathColor: pathColor(),
                  trailColor: "#FFFFFF",
                })}
                className="shadow-[inset_0_3px_10px_rgba(0,0,0,.6)] rounded-full"
              >
                <div className="mt-[1px] text-xs">
                  {employeeEstProbability != 0 ? (
                    employeeEstProbability
                  ) : (
                    <div className="text-[9px]">N/A</div>
                  )}
                </div>
              </CircularProgressbarWithChildren>
            </div>
          </div>
          <div className=" w-full truncate text-[0.688rem] font-normal py-1">
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
            ref={detailViewRef}
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
              {/* datum picker */}
              {correctDealInfo && TLDatum ? (
                <DatePickerComponent
                  deal={correctDealInfo}
                  date={TLDatum}
                  setTLDatum={handleDateChange}
                />
              ) : null}
              {phase !== DealName.Opportunities && (
                <ProbabilityPicker
                  handleProbabilityPicker={handleProbabilityPicker}
                  currentEmployeeProbability={
                    correctDealInfo?.estimated_probability
                      ? correctDealInfo?.estimated_probability
                      : 0
                  }
                />
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
