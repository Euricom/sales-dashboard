import { useContext, useState } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./dropdown-menu";
import { ArrowDown01, ArrowDown10, ArrowDownAZ, ArrowDownUp, ArrowDownZA, ChevronDown, ChevronUp } from "lucide-react";

export enum SortKey {
    AlphASC = "AlphASC",
    AlphDESC = "AlphDESC",
    DateASC = "DateASC",
    DateDESC = "DateDESC"
}

const Sort = [
    {
        key: SortKey.DateASC,
        label: "Nieuwste eerst",
        icon: <ArrowDown01 size={24} />
    },
    {
        key: SortKey.DateDESC,
        label: "Oudste eerst",
        icon: <ArrowDown10 size={24} />
    },
    {
        key: SortKey.AlphASC,
        label: "A - Z",
        icon: <ArrowDownAZ size={24}/>
    },
    {
        key: SortKey.AlphDESC,
        label: "Z - A",
        icon: <ArrowDownZA size={24}/>
    },
]



export function SortMenu() {
    const {sortDeals, addSortDeals} = useContext(DealContext);
    const [isOpenSort, setIsOpenSort] = useState(true);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
            {Sort.filter(s => s.key === sortDeals)[0]?.icon}
            </DropdownMenuTrigger>
            <DropdownMenuContent
            className="w-56 p-2 -my-2 bg-primary border-0 text-white"
            side="right"
            align="start"
            >
                <DropdownMenuLabel
                onClick={() => setIsOpenSort(!isOpenSort)}
                className="flex justify-between bg-white rounded-14 py-2 px-3 mb-2 text-primary items-center"
                >
                    <span>Sorteer</span>
                    {isOpenSort ? <ChevronDown /> : <ChevronUp />}
                </DropdownMenuLabel>
                {isOpenSort && (
                <div className="flex flex-col gap-1">
                    {Sort.map(s => (
                        <DropdownMenuItem
                        key={s.key}
                        onClick={() => addSortDeals(s.key)}
                        className={
                        sortDeals === s.key
                            ? "outline outline-white-400 outline-offset-[-2px] flex justify-between"
                            : "flex justify-between"
                        }
                        >
                            <span>{s.label}</span>
                            {s.icon}
                        </DropdownMenuItem>
                    ))}
                </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}