import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "~/utils/api";
import type {
  DraggableEmployee,
  Employee,
  groupedDealFromDB,
} from "~/lib/types";
import { DealContext } from "./dealsProvider";
import { type SimplifiedDeal } from "~/server/api/routers/teamleader/types";

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
  employeeId: string;
  setEmployeeId: React.Dispatch<React.SetStateAction<string>>;
  isFiltering: boolean;
  setFiltering: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading?: boolean;
  currentEmployeeDetailsId: string;
  setCurrentEmployeeDetailsId: React.Dispatch<React.SetStateAction<string>>;
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
  const {
    data: employeesData,
    isLoading,
    refetch,
  } = api.mongodb.getEmployees.useQuery();
  const mongoEmployeeUpdater = api.mongodb.updateEmployee.useMutation();
  const { deals, dealPhases, uniqueDeals } = useContext(DealContext);

  // Instantiate initial employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFiltering, setFiltering] = useState(false);

  useMemo(() => {
    if (employeesData) {
      // GET employees from MongoDB
      setEmployees(employeesData as Employee[]);
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

  // Other states
  // For filtering
  const [employeeId, setEmployeeId] = useState<string>("");
  useEffect(() => {
    const employeeIdFromStorage = localStorage.getItem("employeeId");
    setEmployeeId(employeeIdFromStorage ? employeeIdFromStorage : "");
  }, [deals]);
  // For the employee details
  const [currentEmployeeDetailsId, setCurrentEmployeeDetailsId] =
    useState<string>("");

  useEffect(() => {
    setSortedData(sortEmployeesData(draggableEmployees));
  }, [draggableEmployees]);

  useEffect(() => {
    if (employees && deals && uniqueDeals) {
      updateEmployeeData(employees, uniqueDeals, deals);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deals, uniqueDeals]);

  function updateEmployeeData(
    employees: Employee[],
    groupedDeals: groupedDealFromDB[],
    deals: SimplifiedDeal[],
  ) {
    let shouldRefetch = false;

    deals.forEach((deal) => {
      // Skip deals without email value
      const emailValue = deal.custom_fields[0]?.value;
      if (!emailValue || emailValue === "") {
        return;
      }

      // Find employee by email
      const employee = employees.find(
        (emp) => emp.fields.Euricom_x0020_email === emailValue,
      );
      if (!employee) return;

      // Find groupedDealId of the deal
      const groupedDeal = groupedDeals.find((groupedDeal) =>
        groupedDeal.value.includes(deal.id),
      );
      if (!groupedDeal) return;
      // look wether the rows of the employee aren't already accurate
      // if no, update the rows of the employee
      // Calculate row identifier
      const phaseName = dealPhases.find(
        (phase) => phase.id === deal.deal_phase.id,
      )?.name;
      const row = `${groupedDeal.id}/${phaseName}`;

      const shouldUpdate =
        !employee.dealIds.includes(deal.id) || !employee.rows.includes(row);

      // Update dealIds if necessary
      if (!employee.dealIds.includes(deal.id)) {
        employee.dealIds.push(deal.id);
      }
      // Update rows if necessary
      if (!employee?.rows.includes(row)) {
        employee?.rows.push(row);
      }

      // update the employee in the database
      if (shouldUpdate) {
        shouldRefetch = true;
        updateEmployeeInDatabase(employee);
      }
    });
    shouldRefetch && refetch().catch(console.error);
  }

  const updateEmployeeInDatabase = (employee: Employee) => {
    // Validate employee data
    if (!employee?.employeeId || !employee.rows || !employee.dealIds) {
      console.error("Invalid employee data");
      return;
    }

    // Perform database update
    mongoEmployeeUpdater.mutate({
      employee: {
        employeeId: employee.employeeId,
        rows: employee.rows as string[],
        dealIds: employee.dealIds,
      },
    });
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        setEmployees,
        draggableEmployees,
        sortedData,
        employeeId,
        setEmployeeId,
        isFiltering,
        setFiltering,
        isLoading,
        currentEmployeeDetailsId,
        setCurrentEmployeeDetailsId,
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
