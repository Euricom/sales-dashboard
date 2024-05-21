import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "~/components/ui/use-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import roles from "~/lib/roles.json";
type RolesJson = {
  employeeRoles: string[];
};

export const determineColors = (role: string | null) => {
  if (!role) return { backgroundColor: "#000000", color: "#ffffff" };

  const roleData = (roles as RolesJson).employeeRoles.find((r) =>
    r.includes(role.replace(/\.(.*?)/, "$1")),
  );
  if (roleData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, backgroundColor, textColor] = roleData.split("_");
    return {
      backgroundColor,
      color: textColor,
    };
  }
};

export const showToastForMoveNotAllowed = () => {
  toast({ title: "error", variant: "destructive", description: "Not Allowed" });
};
