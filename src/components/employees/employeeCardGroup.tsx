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
            <BoardRow row={{ rowId: "0" }} isHeader={true} rowStatus={status} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

export const CollapsibleCardGroups = () => {
  const { sortedData } = useContext(EmployeeContext);

  return (
    <div className="gap-2 flex">
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
        label="Nieuw"
        data={sortedData.openForNewOpportunities}
        status="openForNewOpportunities"
      />
    </div>
  );
};
