import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { EmployeeCardGroup } from "~/components/employees/employeeCardGroup";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import Deals from "../components/teamleader/deals";
import { Column } from "~/components/ui/column";
import { DealContextProvider } from "~/providers/dealsProvider";

export default function Home() {
  const { status } = useSession();

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
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DealContextProvider>
          <main className="flex min-h-screen justify-between mx-4">
            <div className="flex flex-col w-full">
              <div className="flex">
                <Employees />
                <div className="flex gap-4 w-full items-start justify-end my-4">
                  <SignInButton />
                  <RefreshButton />
                </div>
              </div>
              <div className="flex w-full h-full my-2 gap-4">
                <Column title="Deals" size="columnDeals">
                  <Deals />
                </Column>
                <Column title="Mogelijkheden" size="columnMogelijkheden">
                  <div />
                </Column>
                <Column title="Voorgesteld">
                  <div />
                </Column>
                <Column title="Interview">
                  <div />
                </Column>
                <Column title="Weerhouden">
                  <div />
                </Column>
                <Column title="Niet Weerhouden">
                  <div />
                </Column>
              </div>
            </div>
          </main>
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
      <EmployeeCardGroup label="Label" value={employeesData.data?.value} />
    </div>
  );
};
