import { type Session } from "next-auth";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

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

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {data?.session?.user && (
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={loginWithTL}
        >
          LOGIN TL
        </button>
      )}
    </div>
  );
}
