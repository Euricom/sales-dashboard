import { useContext, useEffect } from "react";
import { EmployeeContext } from "~/contexts/employeesProvider";

export function useSyncScroll(columns: NodeListOf<HTMLDivElement> | null) {
  const { currentEmployeeDetailsId, setCurrentEmployeeDetailsId } =
    useContext(EmployeeContext);

  useEffect(() => {
    if (!columns) return;

    function syncScroll(event: Event) {
      if (currentEmployeeDetailsId) setCurrentEmployeeDetailsId("");

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

    columns.forEach((column) => {
      column.addEventListener("scroll", syncScroll);
    });

    return () => {
      columns.forEach((column) => {
        column.removeEventListener("scroll", syncScroll);
      });
    };
  }, [columns]);
}
