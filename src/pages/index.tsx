import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { EmployeeCardGroup } from "~/components/employees/employeeCardGroup";
import { Button } from "~/components/ui/button";
import DealsColumn from "../components/teamleader/dealsColumn";
import Login from "../components/teamleader/login";
import { BoardColumn } from "~/components/ui/dnd/boardColumn";
import type { Employee, LoginProps } from "~/lib/types";
import { DropContext, DropContextProvider } from "~/contexts/dndProvider";
import { v4 as uuidv4 } from "uuid";
import { useContext } from "react";
import { DealContextProvider } from "~/contexts/dealsProvider";
import { EmployeeContextProvider } from "~/contexts/employeesProvider";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function Home() {
  const { status, data } = useSession();

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col gap-4 justify-center items-center w-screen h-screen">
        <h1>You are not signed in</h1>
        <SignInButton />
      </div>
    );
  }
  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Sales Dashboard</title>
          <meta name="description" content="sales-dashboard" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <LoginTeamleader data={{ session: data }} />
        <DealContextProvider>
          <EmployeeContextProvider>
            <DropContextProvider>
              <main className="flex min-h-screen justify-between mx-4">
                <div className="flex flex-col w-full">
                  <div className="flex">
                    {/* <Employees /> */}
                    <div className="flex gap-4 w-full items-start justify-end my-4">
                      <SignInButton />
                      <RefreshButton />
                      <Login data={{ session: data }} />
                    </div>
                  </div>
                  <div className="flex w-full h-full my-2 gap-4">
                    <DealsColumn />
                    <BoardColumn columnTitle="Mogelijkheden" />
                  </div>
                </div>
              </main>
            </DropContextProvider>
          </EmployeeContextProvider>
        </DealContextProvider>
      </>
    );
  }
}

const SignInButton = () => {
  const { data: sessionData } = useSession();

  return (
    <Button
      size={"sm"}
      onClick={sessionData ? () => void signOut() : () => void signIn()}
    >
      {sessionData ? "Sign out" : "Sign in"}
    </Button>
  );
};

const RefreshButton = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Button size={"sm"} onClick={handleRefresh} title="refreshButton">
      Refresh
    </Button>
  );
};

// const Employees = () => {
//   const employeesData = useContext(DropContext);

//   if (employeesData.error) {
//     console.error(employeesData.error);
//     return <div>Error: {employeesData.error.message}</div>;
//   }
//   if (employeesData.isLoading) {
//     return (
//       <div className="flex justify-center items-center w-screen h-screen">
//         <h1>Loading...</h1>
//       </div>
//     );
//   }

//   if (!employeesData.data) return;

//   const employees = employeesData.data.value.map((employee) => {
//     return {
//       employeeId: employee.id,
//       dragId: uuidv4(),
//       rowId: 0,
//       fields: employee.fields,
//     };
//   }) as Employee[];

//   return (
//     <div className="flex w-full justify-start" data-testid="employee-loading">
//       <EmployeeCardGroup label="Label" employees={employees} />
//     </div>
//   );
// };

const LoginTeamleader = async ({ data }: LoginProps) => {
  console.log(data, "data");
  const router = useRouter();
  const { data: redirection } = api.teamleader.getRedirectionURL.useQuery(
    undefined,
    {},
  );

  if (!redirection) return null;
  // Get the current URL
  const currentUrl = router.asPath;

  // Check if the current URL is already the redirection URL
  if (currentUrl !== redirection) {
    await router.push(redirection);
    return null;
  }

  if (data === null) {
    console.error("No session data");
    return <div>Error: No session data</div>;
  }

  return null;
};
