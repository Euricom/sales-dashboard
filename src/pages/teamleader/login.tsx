import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "~/utils/api";

export default function Login() {

  // useEffect(() => {
  //   if (!redirection) return;
  //   push(redirection)
  //     .then(async () => {
  //       await update({ teamleader: true });
  //     })
  //     .catch(async () => {
  //       await update({ teamleader: false });
  //     });
  // }, [push, redirection, update]);

  return (
    <div>
      <h1>Teamleader Login</h1>
      <a href={redirection}>Login with Teamleader</a>
    </div>
  );
}
