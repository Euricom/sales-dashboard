import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { Button } from "~/components/ui/button";
import { BoardColumn } from "~/components/ui/dnd/boardColumn";
import { DropContextProvider } from "~/contexts/dndProvider";
import { DealContextProvider } from "~/contexts/dealsProvider";
import { EmployeeContextProvider } from "~/contexts/employeesProvider";
import { CollapsibleCardGroups } from "~/components/employees/collapsibleCardGroups";
import { ActionMenu } from "~/components/ui/actionMenu";

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
          <meta name="description" content="sales-dashboard" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DealContextProvider>
          <EmployeeContextProvider>
            <DropContextProvider>
              <main className="flex min-h-screen justify-between mx-4">
                <div className="flex flex-col w-full">
                  <div className="flex">
                    <CollapsibleCardGroups />
                    <div className="flex gap-4 w-full items-start justify-end my-4">
                      <ActionMenu />
                    </div>
                  </div>
                  <div className="flex w-full h-full my-2 gap-4">
                    <BoardColumn columnTitle="Deals" />
                    <BoardColumn columnTitle="Mogelijkheden" />
                    <BoardColumn columnTitle="Voorgesteld" />
                    <BoardColumn columnTitle="Interview" />
                    <BoardColumn columnTitle="Weerhouden" />
                    <BoardColumn columnTitle="Niet-Weerhouden" />
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
  return (
    <Button size={"sm"} onClick={() => void signIn()}>
      Sign in
    </Button>
  );
};
