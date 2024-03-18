import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { Button } from "~/components/ui/button";
import DealsColumn from "../components/teamleader/dealsColumn";
import Login from "../components/teamleader/login";
import { BoardColumn } from "~/components/ui/dnd/boardColumn";
import { DropContextProvider } from "~/contexts/dndProvider";
import { DealContextProvider } from "~/contexts/dealsProvider";
import { EmployeeContextProvider } from "~/contexts/employeesProvider";
import { api } from "~/utils/api";
import LoginTeamleader from "~/components/teamleader/LoginTeamleader";
import { useTLRedirection } from "~/hooks/redirection";

export default function Home() {
  const { status, data } = useSession(); // Azure Login
  const { data: redirectionUrl } = api.teamleader.getRedirectionURL.useQuery();

  // If status is not loading & is authenticated, redirect to the TL redirection URL
  useTLRedirection(status, data, redirectionUrl);

  if (status === "unauthenticated") {
    console.log("checking auth state", "unauthenticated");
    return (
      <div className="flex flex-col gap-4 justify-center items-center w-screen h-screen">
        <h1>You are not signed in</h1>
        <SignInButton />
      </div>
    );
  }

  if (status === "authenticated") {
    console.log("checking auth state", "unauthenticated");
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
    window.location.reload();
  };

  return (
    <Button size={"sm"} onClick={handleRefresh} title="refreshButton">
      Refresh
    </Button>
  );
};
