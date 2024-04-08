import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Plus, LogOut, RotateCcw, Expand, Shrink } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function ActionMenu() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRefresh = () => {
    window.location.replace(window.location.href);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      exitFullscreen();
      setIsFullscreen(false);
    } else {
      enterFullScreen();
      setIsFullscreen(true);
    }
  };

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
            onClick={handleFullscreen}
          >
            {isFullscreen ? <Shrink /> : <Expand />}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-fit border-primary border-2 bg-white cursor-pointer"
            onClick={handleRefresh}
          >
            <RotateCcw />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-fit border-primary border-2 bg-white cursor-pointer"
            onClick={() => void signOut()}
          >
            <LogOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const enterFullScreen = () => {
  document.documentElement
    .requestFullscreen()
    .then()
    .catch((err) => {
      console.error("Failed to enter fullscreen", err);
    });
};

const exitFullscreen = () => {
  document
    .exitFullscreen()
    .then()
    .catch((err) => {
      console.error("Failed to enter fullscreen", err);
    });
};
