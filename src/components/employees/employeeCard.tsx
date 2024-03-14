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
    <div className="flex h-15 w-15 justify-center items-center bg-white text-black rounded-2xl">
      {titleToInitials(props.title)}
    </div>
  );
};

export const EmployeeCardDragged = (props: { content: string }) => {
  return (
    <div className="flex h-15 w-15 justify-center items-center bg-white text-black rounded-2xl">
      {props.content}
    </div>
  );
};
