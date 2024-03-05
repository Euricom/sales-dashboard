export const EmployeeCard = (props: {
  title: string;
  jobTitle: string;
  level: string;
  status: string;
  contractStatus: string | null;
}) => {
  return (
    <>
      <EmployeeNoPhoto title={props.title} />
    </>
  );
};

export const EmployeeNoPhoto = (props: { title: string }) => {
  const titleToInitials = (title: string) => {
    return title
      .split(" ")
      .map((string) => string[0])
      .join("");
  };
  return (
    <div className="flex h-[60px] w-[60px] justify-center items-center bg-white text-black rounded-2xl">
      {titleToInitials(props.title)}
    </div>
  );
};
