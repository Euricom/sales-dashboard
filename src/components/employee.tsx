export const EmployeeCard = (props: {
  title: string;
  jobTitle: string;
  level: string;
  status: string;
  subStatus: string;
}) => {

  return (
    <>
      {(props.status || props.subStatus === "End Of Contract" || props.subStatus === "Open For New Opportunities") ? 
        EmployeeWithoutPhoto({
            title: props.title,
          })
        : null}
    </>
  );
};

export const EmployeeWithoutPhoto = (props: { title: string }) => {
  const titleToInitials = (title: string) => {
    return title
      .split(" ")
      .map((word) => word[0])
      .join("");
  };
  return <div className="flex h-[60px] w-[60px] justify-center items-center bg-euricom-primary text-white rounded-2xl">{titleToInitials(props.title)}</div>;
};
