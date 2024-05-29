import { ChevronDown, ChevronUp, Filter, FilterX } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "./dropdown-menu";
import { PmAvatar } from "../teamleader/pmAvatar";
import { employeeRoles } from "~/lib/constants";

export function FilterMenu() {
  const {
    filterPm,
    addPmFilter,
    removePmFilter,
    clearPmFilter,
    getAllPMs,
    filterRole,
    addRoleFilter,
    removeRoleFilter,
    clearRoleFilter,
  } = useContext(DealContext);
  const [isOpenPMs, setIsOpenPMs] = useState(true);
  const [isOpenRoles, setIsOpenRoles] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [clearFilterDisplay, setClearFilterDisplay] = useState(isFiltering);

  useEffect(() => {
    setIsFiltering(!!filterPm.length || !!filterRole.length);
  }, [filterPm, filterRole]);

  // handles ui bug when selecting a filter where the button would be displayed just before auto-closing
  const handleFilter = (isOpen: boolean) => {
    setClearFilterDisplay(isOpen && isFiltering);
  };

  return (
      <DropdownMenu onOpenChange={handleFilter}>
        <DropdownMenuTrigger>
          <Filter size={24} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 p-2 -my-2 bg-primary border-0 text-white"
          side="right"
          align="start"
        >
          <DropdownMenuLabel
            onClick={() => setIsOpenPMs(!isOpenPMs)}
            className="flex justify-between bg-white rounded-14 py-2 px-3 mb-2 text-primary items-center"
          >
            <span>Practice Managers</span>
            {isOpenPMs ? <ChevronDown /> : <ChevronUp />}
          </DropdownMenuLabel>
          {isOpenPMs && (
            <div className="flex flex-col gap-1 mb-2">
              {getAllPMs?.map((pm) => (
                <DropdownMenuItem
                  key={pm.id}
                  onClick={() => {filterPm.includes(pm.id) ? removePmFilter(pm.id): addPmFilter(pm.id);}}
                  className={
                    filterPm.includes(pm.id)
                      ? "outline outline-white-400 outline-offset-[-2px] flex justify-between"
                      : "flex justify-between"
                  }
                >
                  <span>{pm.first_name + " " + pm.last_name}</span>
                  <PmAvatar pm={pm} />
                </DropdownMenuItem>
              ))}
            </div>
          )}
          <DropdownMenuLabel
            onClick={() => setIsOpenRoles(!isOpenRoles)}
            className="flex justify-between bg-white rounded-14 py-2 px-3 text-primary items-center"
          >
            <span>Rollen</span>
            {isOpenRoles ? <ChevronDown /> : <ChevronUp />}
          </DropdownMenuLabel>
          {isOpenRoles && (
            <div className="flex flex-col gap-2 mt-2">
              {employeeRoles.map((role) => (
                <DropdownMenuItem
                  key={role.name}
                  onClick={() => {
                    filterRole.includes(role.name) ? removeRoleFilter(role.name) : addRoleFilter(role.name)}}
                  className={
                    filterRole.includes(role.name)
                      ? "outline outline-white-400 outline-offset-1 justify-center w-full"
                      : "justify-center w-full"
                  }
                  style={{
                    backgroundColor: role.color,
                  }}
                >
                  <span>{role.name}</span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
          {clearFilterDisplay && (
            <DropdownMenuLabel
              onClick={() => {
                clearPmFilter();
                clearRoleFilter();
                handleFilter(false);
              }}
              className="flex items-center justify-center w-full bg-primary rounded-14 py-2 px-3 my-2 text-white border-2"
            >
              <FilterX />
            </DropdownMenuLabel>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
