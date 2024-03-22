import { type UniqueIdentifier } from "@dnd-kit/core";
import type { Session } from "next-auth";

export type RowType = "Row";
export type Row = {
  rowId: string;
  dragItemIds: UniqueIdentifier[] | [];
  employeeIds: UniqueIdentifier[] | [];
};
export type BoardRowProps = {
  row: Row;
  employees: Employee[];
  isOverlay?: boolean;
  isHeader?: boolean;
};

export type EmployeeType = "Employee";
export type Employee = {
  dragItemId: UniqueIdentifier;
  employeeId: string;
  rowId: string;
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

// Teamleader login
export interface LoginProps {
  data: {
    session: Session | null;
  };
}
