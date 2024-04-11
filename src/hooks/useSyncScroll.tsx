import { useEffect } from "react";

export function useSyncScroll(columns: NodeListOf<HTMLDivElement> | null) {
  useEffect(() => {
    if (!columns) return;
    console.log("I get fired");

    function syncScroll(event: WheelEvent) {
      const currentColumn = event.currentTarget as HTMLDivElement;
      const scrollRatio =
        currentColumn.scrollTop /
        (currentColumn.scrollHeight - currentColumn.clientHeight);

      columns?.forEach((column) => {
        if (column !== currentColumn) {
          const scrollAmount =
            scrollRatio * (column.scrollHeight - column.clientHeight);
          column.scrollTop = scrollAmount;
        }
      });
    }

    columns.forEach((column) => {
      column.addEventListener("wheel", syncScroll);
    });

    return () => {
      columns.forEach((column) => {
        column.removeEventListener("wheel", syncScroll);
      });
    };
  }, [columns]);
}
