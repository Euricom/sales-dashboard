import { ListFilter, X } from "lucide-react";
import { useContext } from "react";
import { Button } from "../ui/button";
import { DealContext } from "~/contexts/dealsProvider";
import { EmployeeContext } from "~/contexts/employeesProvider";

export function FilterButton() {
  const { isFiltering, setFiltering } = useContext(EmployeeContext);
  const { setDealIds } = useContext(DealContext);
  const { setEmployeeId } = useContext(EmployeeContext);

  const handleFilter = () => {
    if (isFiltering) {
      setDealIds([]);
      setEmployeeId("");
    }
    setFiltering(!isFiltering);
  };

  return (
    <Button size={"sm"} onClick={handleFilter} title="filterButton">
      {isFiltering ? <X /> : <ListFilter />}
    </Button>
  );
}
