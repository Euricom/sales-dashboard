import { useSession } from "next-auth/react";
import Head from "next/head";
import { BoardColumn } from "~/components/ui/dnd/boardColumn";
import { DropContextProvider } from "~/contexts/dndProvider";
import { DealContextProvider } from "~/contexts/dealsProvider";
import { EmployeeContextProvider } from "~/contexts/employeesProvider";
import { CollapsibleCardGroups } from "~/components/employees/collapsibleCardGroups";
import { ActionMenu } from "~/components/ui/actionMenu";
import { Toaster } from "~/components/ui/toaster";
import Login from "./login";
import { BugReport } from "~/components/ui/bugReport";
import { dealPhases } from "~/lib/constants";
import DealsColumn from "~/components/teamleader/dealsColumn";

export default function Home() {
  const { status } = useSession();

  if (status === "unauthenticated") {
    return <Login />;
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
              <main className="flex justify-between no-scrollbar overflow-hidden">
                <div className="flex flex-col w-full">
                  <CollapsibleCardGroups />
                  <div className="flex w-full px-4 my-2 gap-4 h-[calc(100vh-6.375rem)]">
                      <DealsColumn />
                      {dealPhases.map((dealPhase) => {
                        return (
                          <BoardColumn
                            key={dealPhase.id}
                            dealPhase={dealPhase}
                          />
                        );
                      })}
                  </div>
                </div>
                <BugReport />
                <ActionMenu />
              </main>
              <Toaster />
            </DropContextProvider>
          </EmployeeContextProvider>
        </DealContextProvider>
      </>
    );
  }

  return null;
}
