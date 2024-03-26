import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../../lib/utils";
import { type VariantProps, variants } from "./variants";

export interface ButtonProps extends VariantProps {
  asChild?: boolean;
}

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...restProps
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(variants({ variant, size, className }))}
      {...restProps}
    />
  );
};

export { Button };
