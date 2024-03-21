import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { useState } from "react";
import { BoardRow } from "../ui/dnd/boardRow";
import type { EmployeeCardGroupProps } from "~/lib/types";

export const EmployeeCardGroup = ({
  label,
  employees,
}: EmployeeCardGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
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
          <BoardRow
            row={{ rowId: "0", dragItemIds: [] }}
            employees={employees}
            isHeader={true}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
