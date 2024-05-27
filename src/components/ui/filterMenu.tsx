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
import roles from "~/lib/roles.json";
import { determineColors } from "~/lib/utils";

export function FilterMenu() {
  const {
    PMId,
    setPMId,
    getAllPMs,
    filteringCurrentRole,
    addRoleFilter,
    removeRoleFilter,
    clearRoleFilter,
  } = useContext(DealContext);
  const [isOpenPMs, setIsOpenPMs] = useState(true);
  const [isOpenRoles, setIsOpenRoles] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [clearFilterDisplay, setClearFilterDisplay] = useState(isFiltering);

  useEffect(() => {
    setIsFiltering((PMId !== "" && PMId !== undefined) || !!filteringCurrentRole.length);
  }, [PMId, filteringCurrentRole]);

  // handles ui bug when selecting a filter where the button would be displayed just before auto-closing
  const handleFilter = (isOpen: boolean) => {
    setClearFilterDisplay(isOpen && isFiltering);
  };

  const getRoleTitles = () => {
    return roles.employeeRoles.map((role) =>
      role.split("_")[0]?.replace(/\[(.*?)\]/, "$1"),
    );
  };

  return (
    <>
      <DropdownMenu onOpenChange={handleFilter}>
        <DropdownMenuTrigger>
          <Filter size={24} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 p-2 -my-2 bg-primary border-0 text-white"
          side="right"
          align="start"
        >
          {/** PM FILTER */}
          <DropdownMenuLabel
            onClick={() => setIsOpenPMs(!isOpenPMs)}
            className="flex justify-between bg-white rounded-14 py-2 px-3 mb-2 text-primary items-center"
          >
            <span>Practice Managers</span>
            {isOpenPMs ? <ChevronDown /> : <ChevronUp />}
          </DropdownMenuLabel>
          {isOpenPMs && (
            <div className="mb-2">
              {getAllPMs?.map((pm) => (
                <DropdownMenuItem
                  key={pm.id}
                  onClick={() => {
                    if (pm.id === PMId) {
                      localStorage.setItem("PMId", "");
                      setPMId("");
                    } else {
                      localStorage.setItem("PMId", pm.id);
                      setPMId(pm.id);
                    }
                  }}
                  className={
                    pm.id === PMId
                      ? "outline outline-white-400 outline-offset-1 flex justify-between"
                      : "flex justify-between"
                  }
                  // className="flex justify-between"
                >
                  <span>{pm.first_name + " " + pm.last_name}</span>
                  <PmAvatar pm={pm} />
                </DropdownMenuItem>
              ))}
            </div>
          )}
          {/** TODO: ROLE FILTER */}
          <DropdownMenuLabel
            onClick={() => setIsOpenRoles(!isOpenRoles)}
            className="flex justify-between bg-white rounded-14 py-2 px-3 text-primary items-center"
          >
            <span>Rollen</span>
            {isOpenRoles ? <ChevronDown /> : <ChevronUp />}
          </DropdownMenuLabel>
          {isOpenRoles && (
            <div className="flex flex-col gap-2 mt-2">
              {getRoleTitles().map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => {
                    if (filteringCurrentRole.includes(role!)) {
                      removeRoleFilter(role!)
                    } else {
                      addRoleFilter(role!)
                    }
                  }}
                  className={
                    filteringCurrentRole.includes(role!)
                      ? "outline outline-white-400 outline-offset-1 justify-center w-full"
                      : "justify-center w-full"
                  }
                  style={{
                    backgroundColor: determineColors(role ? role : "")
                      ?.backgroundColor,
                    color: determineColors(role ? role : "")?.color,
                  }}
                >
                  <span>{role}</span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
          {clearFilterDisplay && (
            <DropdownMenuLabel
              onClick={() => {
                localStorage.setItem("PMId", "");
                setPMId("");
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
    </>
  );
}
