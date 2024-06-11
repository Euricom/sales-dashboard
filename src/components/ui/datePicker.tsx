import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DatePicker,
  Dialog,
  Group,
  Heading,
  Popover,
} from "react-aria-components";
import type {
  ButtonProps,
  DateValue,
  PopoverProps,
} from "react-aria-components";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "~/utils/api";
import { type SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import React from "react";
import { useToast } from "~/components/ui/use-toast";
import { PhaseId } from "~/lib/types";

export function DatePickerComponent({
  deal,
  date,
  setTLDatum,
}: {
  deal: SimplifiedDeal;
  date: Date;
  setTLDatum: (date: Date) => void;
  phase: PhaseId
}) {
  const dealDateUpdater = api.teamleader.updatePhaseDate.useMutation();
  const { toast } = useToast();
  const handleOnclick = (date: DateValue) => {
    if (!deal) return;

    // we need to convert the date to an ISO string so we can send it to the server
    const dateObject = new Date(
      date.year,
      date.month - 1,
      date.day,
      12,
    ).toISOString();
    // remove seconds from the time and add timezone
    const isoString = dateObject.substring(0, dateObject.length - 5) + "+02:00";
  
    const input = {
      id: deal.id,
      phaseId: deal.deal_phase.id,
      date: isoString,
    };
    dealDateUpdater.mutate(input, {
      onSuccess: () => {
        setTLDatum(new Date(isoString));
        toast({ title: "success", variant: "success" });
      },
      onError: () => toast({ title: "error", variant: "destructive" }),
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time part

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // remove time part

    if (targetDate.getTime() === today.getTime()) {
      return "Vandaag";
    } else {
      return targetDate.toLocaleDateString("fr-BE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  };

  return (
      <DatePicker
        className="group flex flex-col w-full"
        onChange={(date) => handleOnclick(date)}
        aria-label="Select a date"
      >
        <Group className="flex bg-white/90 focus-within:bg-white group-open:bg-white transition focus-visible:ring-2">
          <AriaButton className="flex gap-1.5 outline-none items-center w-full px-2 p-1 bg-primary rounded-sm text-white justify-between">
            <CalendarIcon width={20} />
            <div className="font-light flex h-5">{formatDate(date)}</div>
          </AriaButton>
        </Group>
        <MyPopover>
          <Dialog className="p-2 no-scrollbar">
            <Calendar className="w-[18.75rem]">
              <header className="flex items-center gap-1 pb-2 px-1 w-full">
                <Heading className="flex-1 font-medium text-2xl ml-2" />
                <RoundButton slot="previous">
                  <ChevronLeft />
                </RoundButton>
                <RoundButton slot="next">
                  <ChevronRight />
                </RoundButton>
              </header>
              <CalendarGrid className="pl-[0.938rem] border-spacing-1 border-separate">
                <CalendarGridHeader>
                  {(day) => (
                    <CalendarHeaderCell className="text-s font-medium">
                      {day}
                    </CalendarHeaderCell>
                  )}
                </CalendarGridHeader>
                <CalendarGridBody>
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={({ isOutsideMonth }) =>
                        isOutsideMonth
                          ? "text-gray-300 w-8 h-8 outline-none cursor-default rounded-full flex items-center justify-center hover:bg-gray-100 pressed:bg-gray-200 selected:bg-violet-700 selected:text-white focus-visible:ring ring-violet-600/70 ring-offset-2"
                          : "w-8 h-8 outline-none cursor-default rounded-full flex items-center justify-center hover:bg-gray-100 pressed:bg-gray-200 selected:bg-violet-700 selected:text-white focus-visible:ring ring-violet-600/70 ring-offset-2"
                      }
                    />
                  )}
                </CalendarGridBody>
              </CalendarGrid>
            </Calendar>
          </Dialog>
        </MyPopover>
      </DatePicker>
  );
}

function RoundButton(props: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className="w-9 h-9 outline-none bg-primary text-white border-0 rounded-14 flex items-center justify-center cursor-pointer"
    />
  );
}

function MyPopover(props: PopoverProps) {
  return (
    <Popover
      {...props}
      className={({ isEntering, isExiting }) => `
        overflow-auto rounded-lg drop-shadow-lg ring-1 ring-black/10 bg-white
        ${
          isEntering
            ? "animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 ease-out duration-200"
            : ""
        }
        ${
          isExiting
            ? "animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 ease-in duration-150"
            : ""
        }
      `}
    />
  );
}
