import type { Active, DataRef, Over } from "@dnd-kit/core";
import type { Row, Employee, EmployeeDragData } from "~/lib/types";

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

export const defaultRows = [
  {
    rowId: 1,
  },
  {
    rowId: 2,
  },
  {
    rowId: 3,
  },
  {
    rowId: 4,
  },
  {
    rowId: 5,
  },
  {
    rowId: 6,
  },
  {
    rowId: 7,
  },
] satisfies Row[];

export const initialEmployees: Employee[] = [
  {
    employeeId: 11,
    rowId: 1,
    fields: {
      Title: "AA",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 12,
    rowId: 1,
    fields: {
      Title: "BB",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 13,
    rowId: 1,
    fields: {
      Title: "CC",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 21,
    rowId: 2,
    fields: {
      Title: "DD",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 22,
    rowId: 2,
    fields: {
      Title: "EE",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 31,
    rowId: 3,
    fields: {
      Title: "FF",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 32,
    rowId: 3,
    fields: {
      Title: "GG",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 33,
    rowId: 3,
    fields: {
      Title: "HH",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
  {
    employeeId: 34,
    rowId: 3,
    fields: {
      Title: "II",
      City: "",
      Job_x0020_title: "",
      Level: "",
      Status: "",
      Contract_x0020_Substatus: "",
    },
  },
];
