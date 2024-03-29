import type { Active, DataRef, Over } from "@dnd-kit/core";

type DraggableData = "Row" | "Employee" | "Column";

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (
    data?.type === "Row" ||
    data?.type === "Employee" ||
    data?.type === "Column"
  ) {
    return true;
  }

  return false;
}
