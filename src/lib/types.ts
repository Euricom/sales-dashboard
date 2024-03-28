import { type UniqueIdentifier } from "@dnd-kit/core";
import type { Session } from "next-auth";

export type RowType = "Row";
export type Row = {
  rowId: string; // `${dealId}/${phaseId}`
};

export type BoardRowProps = {
  row: Row;
  isOverlay?: boolean;
  isHeader?: boolean;
  rowStatus?: string;
};

export type EmployeeType = "Employee";
export type Employee = {
  employeeId: string;
  rows: UniqueIdentifier[];
  fields: {
    Title: string;
    City: string;
    Job_x0020_title: string;
    Level: string;
    Status: string;
    Contract_x0020_Substatus: string;
  };
};

export type DraggableEmployee = {
  dragId: UniqueIdentifier; // `${employeeId}_0_${statusIndicator}` for the header OR `${employeeId}_${row}`
  type: EmployeeType;
  name: string;
};

export type EmployeeCardProps = {
  draggableEmployee: DraggableEmployee;
  isOverlay?: boolean;
  isHeader?: boolean;
};

export type EmployeeCardGroupProps = {
  label: string;
  employees: Employee[];
};

// Teamleader login
export type LoginProps = {
  data: {
    session: Session | null;
  };
};

// Dit binnen halen van teamleader?
export type DealPhase = {
  // id: string;
  name: string;
};
