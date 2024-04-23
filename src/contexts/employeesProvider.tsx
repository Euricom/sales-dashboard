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
  groupedDealObject,
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
  const mongoMutator = api.mongodb.updateDeals.useMutation();
  const { isRefetching, setIsRefetching, filteredDeals } =
    useContext(DealContext);

  // Instantiate initial employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFiltering, setFiltering] = useState(false);
  const [uniqueDeals, setUniqueDeals] = useState<groupedDealObject[]>([]);

  useMemo(() => {
    if (employeesData) {
      // GET employees from MongoDB
      setEmployees(employeesData as Employee[]);
    }
  }, [employeesData]);

  useEffect(() => {
    if (filteredDeals) {
      const newUniqueDeals = [] as groupedDealObject[];
      // Group deals by unique key
      filteredDeals.forEach((deal) => {
        const key = generateKey(deal);
        if (!key) return;
        const existingDeal = newUniqueDeals.find((entry) => entry.id === key);

        if (existingDeal) {
          // If a deal with the same key exists, push the deal ID to its value array
          existingDeal.value.push(deal.id);
        } else {
          // If no deal with the same key exists, create a new entry
          newUniqueDeals.push({ id: key, value: [deal.id] });
        }
      });
      setUniqueDeals(newUniqueDeals);
    }
  }, [filteredDeals]);

  useEffect(() => {
    // Call the mutator function
    mongoMutator.mutate(uniqueDeals);
  }, [uniqueDeals]);

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

function generateKey(deal: SimplifiedDeal | undefined | null) {
  if (!deal) return;
  const string = `${deal.title}, ${deal.company.name}, ${deal.estimated_closing_date}, ${deal.custom_fields[1]?.value}`;

  return btoa(string);
}
