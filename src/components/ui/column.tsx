import { Card, CardHeader, CardContent, CardTitle } from "./card";

export const Column = ({
  title,
  children,
  size,
}: {
  title: string;
  children: React.ReactNode;
  size?: "columnDeals" | "columnMogelijkheden";
}) => {
  return (
    <Card variant="column" size={size ?? "column"}>
      <CardHeader className="pb-1.5">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
};
