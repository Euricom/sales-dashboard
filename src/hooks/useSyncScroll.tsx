import { useContext, useEffect } from "react";
import { EmployeeContext } from "~/contexts/employeesProvider";

export function useSyncScroll(columns: NodeListOf<HTMLDivElement> | null) {
  const { currentEmployeeDetailsId, setCurrentEmployeeDetailsId } =
    useContext(EmployeeContext);

  useEffect(() => {
    if (!columns) return;
    console.log(columns);
    let startTouchPosition: number | null = null;
    let touchMoveRaf: number | null = null;

    function syncScroll(event: Event) {
      if (currentEmployeeDetailsId || currentEmployeeDetailsId !== "")
        setCurrentEmployeeDetailsId("");

      const targetColumn = event.currentTarget as HTMLDivElement;
      const scrollRatio =
        targetColumn.scrollTop /
        (targetColumn.scrollHeight - targetColumn.clientHeight);

      columns?.forEach((column) => {
        if (column !== targetColumn) {
          column.scrollTop =
            scrollRatio * (column.scrollHeight - column.clientHeight);
        }
      });
    }

    function touchStart(e: TouchEvent) {
      if (!e.touches[0]) return;
      startTouchPosition = e.touches[0].clientY;
    }

    function touchMove(e: TouchEvent) {
      if (startTouchPosition === null) return;

      // Cancel the previous requestAnimationFrame, if there is one
      if (touchMoveRaf !== null) {
        cancelAnimationFrame(touchMoveRaf);
      }

      touchMoveRaf = requestAnimationFrame(() => {
        if (!startTouchPosition) return;
        if (!e.touches[0]) return;
        const touchMoveDistance = startTouchPosition - e?.touches[0].clientY;
        const targetColumn = e.currentTarget as HTMLDivElement;
        if (targetColumn === null) return;
        targetColumn.scrollBy(0, touchMoveDistance);

        startTouchPosition = e.touches[0].clientY;

        syncScroll(e);
      });
    }

    function touchEnd() {
      startTouchPosition = null;
    }

    columns.forEach((column) => {
      column.addEventListener("scroll", syncScroll);
      column.addEventListener("touchstart", touchStart);
      column.addEventListener("touchmove", touchMove);
      column.addEventListener("touchend", touchEnd);
    });

    return () => {
      columns.forEach((column) => {
        column.removeEventListener("scroll", syncScroll);
        column.removeEventListener("touchstart", touchStart);
        column.removeEventListener("touchmove", touchMove);
        column.removeEventListener("touchend", touchEnd);
      });

      if (touchMoveRaf !== null) {
        cancelAnimationFrame(touchMoveRaf);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);
}
