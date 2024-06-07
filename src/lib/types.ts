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
    date: Date | null;
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
  shouldCreate?: boolean;
};

export type EmployeeFromDB = {
  employeeId: string;
  rows: UniqueIdentifier[];
  deals: MongoEmployeeDeal[];
};

export type MongoEmployeeDeal = {
  dealId: string;
  date: Date | null;
};

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

export enum PhaseId {
  Opportunities = "7c711ed5-1d69-012b-a341-4c1ed1f057cb",
  Proposed = "1825bd2c-03bf-097c-8549-686bf8f96f4c",
  Interview = "8125dec5-a0ed-0775-a643-774979b85e23",
  Retained = "364b6867-54b9-0694-aa41-cf2ad6617028",
  NonRetained = "7ec460c1-416a-03ce-8460-0299ae10bb38"
}

export enum DealName {
  Opportunities = "Opportunities",
  Proposed = "Proposed",
  Interview = "Interview",
  Retained = "Retained",
  NonRetained = "Non-Retained"
}

export type DealPhase = {
  id?: PhaseId;
  name: DealName;
  label: string
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

export type datePickerReturnProps = {
  calendar: {
    id: string;
  }
  day: number
  era: string
  month: number
  year: number
}