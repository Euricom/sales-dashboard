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
  const { isRefetching, setIsRefetching, deals, dealPhases, uniqueDeals } =
    useContext(DealContext);

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

  const [employeeId, setEmployeeId] = useState<string>("");

  useEffect(() => {
    setSortedData(sortEmployeesData(draggableEmployees));
  }, [draggableEmployees]);

  // fix for the Teamleader sync. dit zou later eventueel moeten worden herschreven want hij voert dit nu 2 keer uit door zijn dependencies
  useEffect(() => {
    if (isRefetching) {
      refetch()
        .then(() => {
          setIsRefetching(false);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [isRefetching, setIsRefetching, refetch]);

  useEffect(() => {
    if (employees && deals && uniqueDeals) {
      updateEmployeeData(employees, uniqueDeals, deals);
    }
  }, [deals, uniqueDeals]);

  function updateEmployeeData(
    employees: Employee[],
    groupedDeals: groupedDealFromDB[],
    deals: SimplifiedDeal[],
  ) {
    deals.forEach((deal) => {
      // check if the deal has an email value, if not, skip the deal
      if (!deal.custom_fields[0]?.value || deal.custom_fields[0].value === "") {
        return;
      }

      // add deal to deals array of employees
      const employee = employees.find(
        (employee) =>
          employee.fields.Euricom_x0020_email === deal.custom_fields[0]?.value,
      );
      if (!employee?.dealIds.includes(deal.id)) {
        employee?.dealIds.push(deal.id);
      }

      // find the groupedDealId of the deal
      const groupedDeal = groupedDeals.find((groupedDeal) =>
        groupedDeal.value.includes(deal.id),
      );
      // look wether the rows of the employee aren't already accurate
      // if no, update the rows of the employee
      if (!groupedDeal) return;
      const phaseName = dealPhases.find(
        (phase) => phase.id === deal.deal_phase.id,
      )?.name;
      const row = groupedDeal?.id + "/" + phaseName;
      if (!employee?.rows.includes(row)) {
        employee?.rows.push(row);
      }

      // update the employee in the database
      if (employee?.employeeId && employee?.rows && employee?.dealIds) {
        mongoEmployeeUpdater.mutate({
          employee: {
            employeeId: employee?.employeeId,
            rows: employee?.rows as string[],
            dealIds: employee?.dealIds,
          },
        });
      }
    });
  }

  return (
    <EmployeeContext.Provider
      value={{
        employees: employees,
        setEmployees: setEmployees,
        draggableEmployees: draggableEmployees,
        sortedData: sortedData,
        employeeId: employeeId,
        setEmployeeId: setEmployeeId,
        isFiltering: isFiltering,
        setFiltering: setFiltering,
        isLoading: isLoading,
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
