import React, { createContext, useEffect, useMemo, useState } from "react";
import { api } from "~/utils/api";
import type { DraggableEmployee, Employee } from "~/lib/types";

type EmployeeContextType = {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  draggableEmployees: DraggableEmployee[];
  sortedData: {
    bench: DraggableEmployee[];
    endOfContract: DraggableEmployee[];
    starter: DraggableEmployee[];
    openForNewOpportunities: DraggableEmployee[];
  };
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
  // GET employees data
  const employeesData = api.mongodb.getEmployees.useQuery();
  // Instantiatein itial employees
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (employeesData) {
      // GET employees from MongoDB
      setEmployees(employeesData.data as Employee[]);
    }
  }, [employeesData]);

  const draggableEmployees: DraggableEmployee[] = useMemo(() => {
    if (!employees) return [];
    return employees.flatMap((employee) =>
      employee.rows.map((row) => {
        if (row === "0") {
          const statusIndicator =
            employee.fields.Status === "Bench"
              ? "bench"
              : employee.fields.Status === "Starter"
                ? "starter"
                : employee.fields.Contract_x0020_Substatus === "End of Contract"
                  ? "endOfContract"
                  : "openForNewOpportunities";
          return {
            dragId: `${employee.employeeId}_${row}_${statusIndicator}`,
            type: "Employee",
            name: employee.fields.Title,
          };
        }
        return {
          dragId: `${employee.employeeId}_${row}`,
          type: "Employee",
          name: employee.fields.Title,
        };
      }),
    );
  }, [employees]);

  // Sort the initial employees data into the correct arrays based on their status
  const [sortedData, setSortedData] = useState<{
    bench: DraggableEmployee[];
    endOfContract: DraggableEmployee[];
    starter: DraggableEmployee[];
    openForNewOpportunities: DraggableEmployee[];
  }>(sortEmployeesData(draggableEmployees));

  useEffect(() => {
    setSortedData(sortEmployeesData(draggableEmployees));
  }, [draggableEmployees]);

  return (
    <EmployeeContext.Provider
      value={{
        employees: employees,
        setEmployees: setEmployees,
        draggableEmployees: draggableEmployees,
        sortedData: sortedData,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

const sortEmployeesData = (draggableEmployees: DraggableEmployee[]) => {
  const bench: DraggableEmployee[] = [],
    starter: DraggableEmployee[] = [],
    endOfContract: DraggableEmployee[] = [],
    openForNewOpportunities: DraggableEmployee[] = [];

  // add the users to the correct array based on their status
  draggableEmployees.forEach((draggableEmployee) => {
    if (!draggableEmployee) return;

    const status = (draggableEmployee.dragId as string).split("_")[2];

    if (!status) return;

    if (status === "bench") {
      bench.push(draggableEmployee);
    } else if (status === "starter") {
      starter.push(draggableEmployee);
    } else if (status === "endOfContract") {
      endOfContract.push(draggableEmployee);
    } else {
      openForNewOpportunities.push(draggableEmployee);
    }
  });

  return { bench, endOfContract, starter, openForNewOpportunities };
};
