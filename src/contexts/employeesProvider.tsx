import React, { createContext } from "react";
import { api } from "~/utils/api";
import type { Employee } from "~/lib/types";
import { v4 as uuidv4 } from "uuid";

type EmployeeContextType = {
  employees: Employee[] | null;
};

export const EmployeeContext = createContext<EmployeeContextType>(
  {} as EmployeeContextType,
);

type EmployeeContextProviderProps = {
  children: React.ReactNode;
};

export const EmployeeContextProvider: React.FC<
  EmployeeContextProviderProps
> = ({ children }) => {
  // GET employees data from SharePoint
  const employeesData = api.sharePoint.getEmployeesData.useQuery();

  const mappedEmployees = employeesData?.data?.value.map((employee) => ({
    employeeId: employee.id,
    dragId: uuidv4(),
    rowId: "0",
    fields: employee.fields,
  })) as Employee[];

  if (!mappedEmployees) {
    return;
  }

  return (
    <EmployeeContext.Provider
      value={{
        employees: mappedEmployees,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
