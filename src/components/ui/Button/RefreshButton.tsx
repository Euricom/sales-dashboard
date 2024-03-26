import { Button } from "./Button";

export const RefreshButton = () => {
  const handleRefresh = () => {
    window.location.replace(window.location.href);
  };

  return (
    <Button size={"sm"} onClick={handleRefresh} title="refreshButton">
      Refresh
    </Button>
  );
};
