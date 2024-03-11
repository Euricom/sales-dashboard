import { type Session } from "next-auth";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "../ui/button";

export interface LoginProps {
  data: {
    session: Session | null;
  };
}

export default function Login({ data }: LoginProps) {
  const router = useRouter();
  const { data: redirection } = api.teamleader.getRedirectionURL.useQuery(
    undefined,
    {},
  );

  const loginWithTL = async () => {
    if (!redirection) return;
    await router.push(redirection);
  };

  if (data === null) {
    console.error("No session data");
    return <div>Error: No session data</div>;
  }

  // waarom een login knop? --> na login op azure login knop voor teamleader of gewoon redirecten naar teamleader?
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {data?.session?.user && (
        <Button size={"sm"} onClick={loginWithTL}>
          Login Teamleader
        </Button>
      )}
    </div>
  );
}
