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

// export const defaultRows = [
//   {
//     rowId: 1,
//   },
//   {
//     rowId: 2,
//   },
//   {
//     rowId: 3,
//   },
//   {
//     rowId: 4,
//   },
//   {
//     rowId: 5,
//   },
//   {
//     rowId: 6,
//   },
//   {
//     rowId: 7,
//   },
// ] satisfies RowId[];

// export const defaultEmployees = [
//   {
//     employeeId: 11,
//   },
//   {
//     employeeId: 12,
//   },
//   {
//     employeeId: 13,
//   },
//   {
//     employeeId: 21,
//   },
//   {
//     employeeId: 22,
//   },
//   {
//     employeeId: 31,
//   },
//   {
//     employeeId: 32,
//   },
//   {
//     employeeId: 33,
//   },
//   {
//     employeeId: 34,
//   },
// ];

// export const mockEmployees: Employee[] = [
//   {
//     employeeId: 11,
//     dragId: 1,
//     rowId: 1,
//     fields: {
//       Title: "AA",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 12,
//     dragId: 2,
//     rowId: 1,
//     fields: {
//       Title: "BB",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 13,
//     dragId: 3,
//     rowId: 1,
//     fields: {
//       Title: "CC",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 21,
//     dragId: 4,
//     rowId: 2,
//     fields: {
//       Title: "DD",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 22,
//     dragId: 5,
//     rowId: 2,
//     fields: {
//       Title: "EE",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 31,
//     dragId: 6,
//     rowId: 3,
//     fields: {
//       Title: "FF",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 32,
//     dragId: 7,
//     rowId: 3,
//     fields: {
//       Title: "GG",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 33,
//     dragId: 8,
//     rowId: 3,
//     fields: {
//       Title: "HH",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
//   {
//     employeeId: 34,
//     dragId: 9,
//     rowId: 3,
//     fields: {
//       Title: "II",
//       City: "",
//       Job_x0020_title: "",
//       Level: "",
//       Status: "",
//       Contract_x0020_Substatus: "",
//     },
//   },
// ];
