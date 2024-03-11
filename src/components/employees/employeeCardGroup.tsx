import { EmployeeCard } from "./employeeCard";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { useState } from "react";

export const EmployeeCardGroup = (props: {
  label: string;
  value?: {
    // TODO: Moet undefined check moet nog verplaatst worden naar index.tsx?
    id: string;
    fields: {
      Title: string;
      City: string;
      Job_x0020_title: string;
      Level: string;
      Status: string;
      Contract_x0020_Substatus?: string;
    };
  }[];
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex bg-white pt-1.5 border-x-4 border-b-4 tv:border-x-8 tv:border-b-[6px] border-white h-fit w-fit rounded-b-2xl top-0 items-center justify-between"
      >
        <CollapsibleTrigger
          className={`h-[76px] tv:h-[152px] p-0 text-primary hover:bg-primary/10 hover:text-accent-foreground rounded-xl ${isOpen ? "mr-1" : "mr-0"}`}
          title="CollapsibleTrigger"
        >
          <h4 className="text-sm font-semibold -rotate-90">Label</h4>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className="flex justify-center gap-4 bg-primary px-3.5 py-2 rounded-2xl"
            title="CollapsibleContent"
          >
            {props.value
              ?.sort((a, b) => a.fields.Title.localeCompare(b.fields.Title))
              .map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  title={employee.fields.Title}
                  jobTitle={employee.fields.Job_x0020_title}
                  level={employee.fields.Level}
                  status={employee.fields.Status}
                  contractStatus={
                    employee.fields.Contract_x0020_Substatus ?? null
                  }
                />
              ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};
