import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { useContext, useState } from "react";
import { BoardRow } from "../ui/dnd/boardRow";
import { EmployeeContext } from "~/contexts/employeesProvider";
import type { DraggableEmployee } from "~/lib/types";

type CollapsibleCardGroupProps = {
  label: string;
  data: DraggableEmployee[];
  status?: string;
};

const CollapsibleCardGroup: React.FC<CollapsibleCardGroupProps> = ({
  label,
  data,
  status,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoading } = useContext(EmployeeContext);

  if (isLoading) {
    let amountOfSkeletons;

    switch(label) {
      case "Bench":
        amountOfSkeletons = 6;
        break;
      case "Starter":
        amountOfSkeletons = 1;
        break;
      default: 
        amountOfSkeletons = 2;
    }

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex bg-white bg-opacity-75 pt-1.5 border-x-4 border-b-4 tv:border-x-8 tv:border-b-[6px] border-grey h-fit w-fit rounded-b-2xl top-0 items-center justify-between animate-pulse"
      >
        <CollapsibleTrigger
          className={`h-[4.75rem] p-0 text-primary hover:bg-primary/10 hover:text-accent-foreground rounded-xl ${isOpen ? "mr-1" : "mr-0"}`}
        >
          <h4 className="text-sm font-semibold -rotate-90">{label}</h4>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex h-[4.75rem] justify-center gap-4 bg-primary px-3.5 py-2 rounded-2xl">
            <div className="bg-primary rounded-14 animate-pulse">
              <div className="flex flex-row gap-2">
                {Array.from({ length: amountOfSkeletons }).map((_, index) => (
                  <div
                    key={index}
                    className="h-15 w-15 bg-white bg-opacity-90 rounded-14 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (!data.length)
    return (
      <div className="flex bg-white bg-opacity-75 pt-1.5 border-x-4 border-b-4 tv:border-x-8 tv:border-b-[6px] border-grey h-fit w-fit rounded-b-2xl top-0 items-center justify-between">
        <div
          className={`h-[4.75rem] p-0 text-primary inline-flex items-center justify-center`}
        >
          <h4 className="text-sm font-semibold -rotate-90">{label}</h4>
        </div>
      </div>
    );

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex bg-white pt-1.5 border-x-4 border-b-4 tv:border-x-8 tv:border-b-[6px] border-white h-fit w-fit rounded-b-2xl top-0 items-center justify-between"
      >
        <CollapsibleTrigger
          className={`h-[4.75rem] text-primary hover:bg-primary/10 hover:text-accent-foreground rounded-xl ${isOpen ? "mr-1" : "mr-0"} relative`}
        >
          <h4 className="text-sm font-semibold -rotate-90">{label}</h4>
          {!isOpen && <div className="absolute text-gray-600 top-[0px] right-[1px] text-[10px]">{data.length}</div>}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex h-[4.75rem] justify-center bg-primary pl-3.5 pr-8 py-2 rounded-2xl relative">
            <BoardRow row={{ rowId: "0" }} isHeader={true} rowStatus={status} />
            <div className="absolute text-white top-[5px] right-[8px] text-[10px]">{data.length}</div>
          </div>
        </CollapsibleContent>
      </Collapsible>
  );
};

export const CollapsibleCardGroups = () => {
  const { sortedData } = useContext(EmployeeContext);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-2 px-4 no-scrollbar overflow-x-auto ">
      <CollapsibleCardGroup
        label="Bench"
        data={sortedData.bench}
        status="bench"
      />
      <CollapsibleCardGroup
        label="Einde"
        data={sortedData.endOfContract}
        status="endOfContract"
      />
      <CollapsibleCardGroup
        label="Starter"
        data={sortedData.starter}
        status="starter"
      />
      <CollapsibleCardGroup
        label="Open"
        data={sortedData.openForNewOpportunities}
        status="openForNewOpportunities"
      />
      </div>
    </div>
  );
};
