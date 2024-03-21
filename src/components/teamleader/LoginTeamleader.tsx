import {useRouter} from "next/router";

interface Props {
  data: any;
}
export default function LoginTeamleader({ data }: Props) {
  // console.log(data, "data");
  // const router = useRouter();
  // const { data: redirection } = api.teamleader.getRedirectionURL.useQuery(
  //   undefined,
  //   {},
  // );

  // if (!redirection) return null;
  // // Get the current URL
  // const currentUrl = router.asPath;

  // // Check if the current URL is already the redirection URL
  // if (currentUrl !== redirection) {
  //   await router.push(redirection);
  //   return null;
  // }

  // if (data === null) {
  //   console.error("No session data");
  //   return <div>Error: No session data</div>;
  // }

  return null;
}
