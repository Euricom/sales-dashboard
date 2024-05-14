import { type UniqueIdentifier } from "@dnd-kit/core";
import type { Session } from "next-auth";
import { type SimplifiedDeal } from "~/server/api/routers/teamleader/types";

export type RowType = "Row";
export type Row = {
  rowId: string; // `${dealId}/${phaseId}`
};

export type BoardRowProps = {
  row: Row;
  isOverlay?: boolean;
  isHeader?: boolean;
  rowStatus?: string;
  isFiltering?: boolean;
};

export type EmployeeType = "Employee";
export type Employee = {
  employeeId: string;
  rows: UniqueIdentifier[];
  deals: {
    dealId: string;
    datum: Date | null;
  }[];
  weeksLeft: number;
  fields: {
    Title: string;
    City: string;
    Job_x0020_title: string;
    Level: string;
    Status: string;
    Contract_x0020_Substatus: string;
    Contract_x0020_Status_x0020_Date: string | null;
    avatar: string | null;
    Euricom_x0020_email: string | null;
  };
};

export type EmployeeFromDB = {
  employeeId: string;
  rows: UniqueIdentifier[];
  deals: MongoEmployeeDeal[];
};

export type MongoEmployeeDeal =  {
  dealId: string;
  datum: Date | null;
}


export type DraggableEmployee = {
  dragId: UniqueIdentifier; // `${employeeId}_0_${statusIndicator}` for the header OR `${employeeId}_${row}`
  type: EmployeeType;
  name: string;
  weeksLeft: number;
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
  id: string | undefined;
  name: string;
};

export type PM = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
};

export type groupedDealFromDB = {
  id: string;
  value: string[];
};

export type GroupedDeal = {
  deal: SimplifiedDeal;
  groupedDealId: string;
};

export type datePickerReturnProps= {
  calendar: {
    id: string;
  }
  day: number
  era: string
  month: number
  year: number
}