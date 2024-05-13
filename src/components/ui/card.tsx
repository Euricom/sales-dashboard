import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "~/lib/utils";

const cardVariants = cva("text-white rounded-14", {
  variants: {
    variant: {
      default: "bg-secondary",
      column: "flex flex-col bg-secondary relative",
      columnHighlight:
        "flex flex-col bg-primary-foreground outline outline-white-400 outline-offset-1",
      deal: "flex justify-between bg-primary gap-3",
      row: "bg-none",
      dealhighlight:
        "flex justify-between bg-secondary gap-3 outline outline-white-400 outline-offset-1",
      rowhighlight: "bg-none outline-dashed outline-white-400 outline-offset-1",
      columnDeals: "flex flex-col bg-secondary relative",
    },
    size: {
      default: "h-full px-4 py-2",
      column: "h-full px-4 py-2 flex-1",
      columnDeals: "h-full px-4 py-2 basis-[22.5rem]", // Neemt breedte van de content
      columnMogelijkheden: "h-full w-[24rem] px-4 py-2", // Breedte is voor 4 employees, +1 employee is 76px extra en 152px extra voor tv
      deal: "h-[3.75rem] w-full min-w-[24rem] w-full pl-1.5 pr-1.5 py-1.5",
      row: "min-h-15 h-15",
      employee: "h-15 w-15 justify-center items-center bg-secondary",
      employeeDragged:
        "h-15 w-20 justify-center items-center bg-primary z-10 relative",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cn(cardVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
