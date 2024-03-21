import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { useState } from "react";
import type {
  SharePointEmployee,
  SharePointContact,
} from "~/server/api/routers/sharepoint/types";
import { BoardRow } from "../ui/dnd/boardRow";
import type { EmployeeCardGroupProps } from "~/lib/types";

export const EmployeeCardGroup = ({
  value,
}: {
  value: {
    bench: SharePointContact["value"];
    starter: SharePointContact["value"];
    endOfContract: SharePointContact["value"];
    openForNewOpportunities: SharePointContact["value"];
  };
}) => {
  console.log(value);

  return (
    <div className="gap-2 flex">
      <ReturnCardGroup label="Bench" data={value.bench} />
      <ReturnCardGroup label="Einde" data={value.endOfContract} />
      <ReturnCardGroup label="Starter" data={value.starter} />
      <ReturnCardGroup label="Nieuw" data={value.openForNewOpportunities} />
    </div>
  );
};

type ReturnCardGroupProps = {
  data: SharePointEmployee[];
  label: string;
};

const ReturnCardGroup: React.FC<ReturnCardGroupProps> = ({ data, label }) => {
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
          <h4 className="text-sm font-semibold -rotate-90">{label}</h4>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className="flex justify-center gap-4 bg-primary px-3.5 py-2 rounded-2xl"
            title="CollapsibleContent"
          >
            {data
              ?.sort((a: SharePointEmployee, b: SharePointEmployee) =>
                a.fields.Title.localeCompare(b.fields.Title),
              )
              .map((employee: SharePointEmployee) => (
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
