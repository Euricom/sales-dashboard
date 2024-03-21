import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { useContext, useState } from "react";
import { BoardRow } from "../ui/dnd/boardRow";
import { EmployeeContext } from "~/contexts/employeesProvider";
import type { Employee } from "~/lib/types";

export const EmployeeCardGroup = () => {
  const value = useContext(EmployeeContext);

  if (!value.employeesSharepoint) return null;
  const sortedData = sortEmployeesData(value.employeesSharepoint);

  return (
    <div className="gap-2 flex">
      <ReturnCardGroup label="Bench" data={sortedData.bench} />
      <ReturnCardGroup label="Einde" data={sortedData.endOfContract} />
      <ReturnCardGroup label="Starter" data={sortedData.starter} />
      <ReturnCardGroup
        label="Nieuw"
        data={sortedData.openForNewOpportunities}
      />
    </div>
  );
};

type ReturnCardGroupProps = {
  data: Employee[];
  label: string;
};

const ReturnCardGroup: React.FC<ReturnCardGroupProps> = ({ data, label }) => {
  const [isOpen, setIsOpen] = useState(true);
  const sortedEmployeeGroup = data.sort((a, b) =>
    a.fields.Title.localeCompare(b.fields.Title),
  );

  if (data.length === 0)
    return (
      <div className="flex bg-white bg-opacity-75 pt-1.5 border-x-4 border-b-4 tv:border-x-8 tv:border-b-[6px] border-grey h-fit w-fit rounded-b-2xl top-0 items-center justify-between">
        <div
          className={`h-[76px] tv:h-[152px] p-0 text-primary inline-flex items-center justify-center`}
        >
          <h4 className="text-sm font-semibold -rotate-90">{label}</h4>
        </div>
      </div>
    );

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex bg-white pt-1.5 border-x-4 border-b-4 tv:border-x-8 tv:border-b-[6px] border-white h-fit w-fit rounded-b-2xl top-0 items-center justify-between"
      >
        <CollapsibleTrigger
          className={`h-[4.75rem] p-0 text-primary hover:bg-primary/10 hover:text-accent-foreground rounded-xl ${isOpen ? "mr-1" : "mr-0"}`}
          title="CollapsibleTrigger"
        >
          <h4 className="text-sm font-semibold -rotate-90">{label}</h4>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className="flex h-[4.75rem] justify-center gap-4 bg-primary px-3.5 py-2 rounded-2xl"
            title="CollapsibleContent"
          >
            {/* <h4 className="text-sm font-semibold -rotate-90">{label}</h4>
            <div
              className="flex justify-center gap-4 bg-primary px-3.5 py-2 rounded-2xl"
              title="CollapsibleContent"
            > */}
            {/* {data
                ?.sort((a: Employee, b: Employee) =>
                  a.fields.Title.localeCompare(b.fields.Title),
                )
                .map((employee: Employee) => (
                  <EmployeeCardDragged
                    key={employee.dragItemId}
                    employee={employee}
                  />
                ))} */}
            <BoardRow
              row={{
                rowId: "0",
                dragItemIds: sortedEmployeeGroup.map((e) => e.dragItemId),
              }}
              employees={sortedEmployeeGroup.map((e) => e)}
              isHeader={true}
            />
            {/* </div> */}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

export const sortEmployeesData = (data: Employee[]) => {
  const bench: Employee[] = [];
  const starter: Employee[] = [];
  const endOfContract: Employee[] = [];
  const openForNewOpportunities: Employee[] = [];

  // add the users to the correct array based on their status
  data.forEach((contact) => {
    const status = contact.fields.Status;
    const subStatus = contact.fields.Contract_x0020_Substatus;

    if (status === "Bench") {
      bench.push(contact);
    } else if (status === "Starter") {
      starter.push(contact);
    } else if (subStatus === "End of Contract") {
      endOfContract.push(contact);
    } else if (subStatus === "Open for New Opportunities") {
      openForNewOpportunities.push(contact);
    }
  });

  // create an object with the sorted data
  const sortedData = {
    bench,
    endOfContract,
    starter,
    openForNewOpportunities,
  };

  return sortedData;
};
