import { api } from "~/utils/api";
import Cookies from "js-cookie";

export default function Deals() {
  function getAccessTokenFromCookie() {
    const accessToken = Cookies.get("access_token");
    if (accessToken) {
      const dealsData = api.teamleader.getDealsData.useQuery(accessToken);
      return dealsData;
    }
    return "";
  }

  console.log(getAccessTokenFromCookie());
  return (
    <div>
      We need this to be on the homepage, however at the moment this is for
      testing :D
    </div>
  );
}
