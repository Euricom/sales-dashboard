import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Plus, LogOut, RotateCcw } from "lucide-react";
import { signOut } from "next-auth/react";

export function ActionMenu() {
  return (
    <div className="absolute bottom-6 right-9 z-20">
      <DropdownMenu>
        <DropdownMenuTrigger className="bg-primary text-white rounded-14 hover:bg-white hover:text-primary p-2">
          <Plus size={32} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-fit flex flex-col gap-0.5 bg-transparent border-none shadow-none"
          side="top"
          align="end"
        >
          <DropdownMenuItem
            className="w-fit border-primary border-2 bg-white cursor-pointer"
            onClick={() => void signOut()}
          >
            <LogOut />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="w-fit border-primary border-2 bg-white cursor-pointer"
            onClick={handleRefresh}
          >
            <RotateCcw />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const handleRefresh = () => {
  window.location.replace(window.location.href);
};
