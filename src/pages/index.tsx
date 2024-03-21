import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { Button } from "~/components/ui/button";
import { BoardColumn } from "~/components/ui/dnd/boardColumn";
import { DropContextProvider } from "~/contexts/dndProvider";
import { DealContextProvider } from "~/contexts/dealsProvider";
import { EmployeeContextProvider } from "~/contexts/employeesProvider";
import { api } from "~/utils/api";
import LoginTeamleader from "~/components/teamleader/LoginTeamleader";
import Deals from "../components/teamleader/deals";
import { Column } from "~/components/ui/column";
import { DealContextProvider } from "~/providers/dealsProvider";

export default function Home() {
  const { status } = useSession();

  // If status is not loading & is authenticated, redirect to the TL redirection URL
  //useTLRedirection(status, data, redirectionUrl);

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
                      {/* <Login data={{ session: data }} /> */}
                    </div>
                  </div>
                  <div className="flex w-full h-full my-2 gap-4">
                    <BoardColumn columnTitle="Mogelijkheden" />
                  </div>
                </div>
              </main>
            </DropContextProvider>
          </EmployeeContextProvider>
        </DealContextProvider>
                  <Deals />
      </>
    );
  }

  return null;
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
    window.location.replace(window.location.href);
  };

  return (
    <Button size={"sm"} onClick={handleRefresh} title="refreshButton">
      Refresh
    </Button>
  );
};

const Employees = () => {
  const employeesData = api.sharePoint.getEmployeesData.useQuery();

  if (employeesData.error) {
    console.error(employeesData.error);
    return <div>Error: {employeesData.error.message}</div>;
  }
  if (employeesData.isLoading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <h1>Loading...</h1>
      </div>
    );
  }
  return (
    <div className="flex w-full justify-start" data-testid="employee-loading">
      <EmployeeCardGroup value={employeesData.data} />
    </div>
  );
};
