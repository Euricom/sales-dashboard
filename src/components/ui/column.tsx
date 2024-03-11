import { Card, CardHeader, CardContent, CardTitle } from "./card";

export const Column = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Card variant={"column"} size={"column"}>
      <CardHeader className="pb-1.5">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
};
