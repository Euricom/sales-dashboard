import type { Active, DataRef, Over } from "@dnd-kit/core";
import type { EmployeeDragData } from "~/lib/types";

type DraggableData = "Row" | EmployeeDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Row" || data?.type === "Employee") {
    return true;
  }

  return false;
}
