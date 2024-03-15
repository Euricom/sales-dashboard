import { type UniqueIdentifier } from "@dnd-kit/core";
import { type defaultRows } from "~/components/ui/dnd/utils";

export type RowId = (typeof defaultRows)[number]["rowId"];
export type RowType = "Row";
export type Row = {
  rowId: UniqueIdentifier;
};
export type BoardRowProps = {
  row: Row;
  employees: Employee[];
  isOverlay?: boolean;
  isHeader?: boolean;
};

export type EmployeeType = "Employee";
export type Employee = {
  employeeId: UniqueIdentifier;
  rowId: RowId;
  fields: {
    Title: string;
    City: string;
    Job_x0020_title: string;
    Level: string;
    Status: string;
    Contract_x0020_Substatus: string;
  };
};

export type EmployeeCardProps = {
  employee: Employee;
  isOverlay?: boolean;
  isHeader?: boolean;
};
export type EmployeeDragData = {
  type: EmployeeType;
  employee: Employee;
};

export type EmployeeCardGroupProps = {
  label: string;
  employees: Employee[];
};
