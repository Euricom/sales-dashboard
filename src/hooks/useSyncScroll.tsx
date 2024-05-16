import { useContext, useEffect } from "react";
import { EmployeeContext } from "~/contexts/employeesProvider";

export function useSyncScroll(columns: NodeListOf<HTMLDivElement> | null) {
  const { currentEmployeeDetailsId, setCurrentEmployeeDetailsId } =
    useContext(EmployeeContext);

  useEffect(() => {
    if (!columns) return;

    const syncScroll = (scrolledEle: HTMLElement, ele: HTMLElement) => {
      const top = scrolledEle.scrollTop;
      const left = scrolledEle.scrollLeft;
      ele.scrollTo({
        behavior: "instant",
        top,
        left,
      });
    };

    const handleScroll = (e: Event) => {
      const scrolledEle = e.target as HTMLElement;
      const columnsArray = Array.from(columns);

      columnsArray
        .filter((item) => item !== scrolledEle)
        .forEach((ele) => {
          syncScroll(scrolledEle, ele);
        });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchedEle = e.target as HTMLElement;
      const columnsArray = Array.from(columns);

      columnsArray
        .filter((item) => item !== touchedEle)
        .forEach((ele) => {
          syncScroll(touchedEle, ele);
        });
    };

    // Add scroll event listener to all columns once
    columns.forEach((ele: HTMLElement) => {
      ele.addEventListener("scroll", handleScroll);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      columns.forEach((ele: HTMLElement) => {
        ele.removeEventListener("scroll", handleScroll);
      });
    };
  }, [columns]);
}
