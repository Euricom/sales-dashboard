import { useEffect } from "react";

export function useSyncDragScroll(columns: NodeListOf<HTMLDivElement> | null) {
  useEffect(() => {
    if (!columns) return;

    function syncScroll(event: Event) {
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
