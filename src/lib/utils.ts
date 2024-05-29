import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "~/components/ui/use-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const showToastForMoveNotAllowed = () => {
  toast({ title: "error", variant: "destructive", description: "Not Allowed" });
};
