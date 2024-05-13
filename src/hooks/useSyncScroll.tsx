import { useContext, useEffect } from "react";
import { EmployeeContext } from "~/contexts/employeesProvider";
export function useSyncScroll(columns: NodeListOf<HTMLDivElement> | null) {
  const { currentEmployeeDetailsId, setCurrentEmployeeDetailsId } =
    useContext(EmployeeContext);

  useEffect(() => {
    if (!columns) return;

    const syncScroll = (scrolledEle: HTMLDivElement, ele: HTMLDivElement) => {
      const top = scrolledEle.scrollTop;
      const left = scrolledEle.scrollLeft;
      ele.scrollTo({
        behavior: "instant",
        top,
        left,
      });
    };

    const handleScroll = (e: Event) => {
      const scrolledEle = e.target as HTMLDivElement;
      const columnsArray = Array.from(columns);

      columnsArray
        .filter((item) => item !== scrolledEle)
        .forEach((ele) => {
          ele.removeEventListener("scroll", handleScroll);
          syncScroll(scrolledEle, ele);
          window.requestAnimationFrame(() => {
            ele.addEventListener("scroll", handleScroll);
          });
        });
    };

    columns.forEach((ele: HTMLDivElement) => {
      ele.addEventListener("scroll", handleScroll);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);
}
