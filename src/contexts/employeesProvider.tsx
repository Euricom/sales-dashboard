import React, { createContext, useState } from "react";
import { api } from "~/utils/api";
import type { Employee } from "~/lib/types";
import { v4 as uuidv4 } from "uuid";

type EmployeeContextType = {
  employeesSharepoint: Employee[] | [];
  employeesMogelijkheden: Employee[] | [];
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
  // TODO: MAKE useMemo and useCallback's
  // GET employees data from SharePoint
  const sharepointEmployeesData = api.sharePoint.getEmployeesData.useQuery();
  const employeesMogelijkheden = useState([]);
  // if (employeesData.error) {
  //   console.error(employeesData.error);
  //   return <div>Error: {employeesData.error.message}</div>;
  // }
  // if (employeesData.isLoading) {
  //   return (
  //     <div className="flex justify-center items-center w-screen h-screen">
  //       <h1>Loading...</h1>
  //     </div>
  //   );
  // }
  // Add unique dragId to employees & rowId

  const mappedEmployees = sharepointEmployeesData?.data?.map((employee) => ({
    employeeId: employee.id,
    dragItemId: uuidv4(),
    rowId: "0",
    fields: employee.fields,
  })) as Employee[];

  if (!mappedEmployees) {
    return;
  }

  return (
    <EmployeeContext.Provider
      value={{
        employeesSharepoint: mappedEmployees,
        employeesMogelijkheden: employeesMogelijkheden as unknown as Employee[],
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
