import { api } from "~/utils/api";
import Cookies from "js-cookie";

export default function Deals() {
  function geTLData() {
    const accessToken = Cookies.get("access_token");
    const expires_at = Cookies.get("access_expires_at");

    if (accessToken && expires_at && new Date(expires_at) > new Date()) {
      const dealsData = api.teamleader.getDealsData.useQuery(accessToken);
      return dealsData;
    } else if (new Date(expires_at) < new Date()) {
      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        console.error("No refresh token found");
        return;
      }
      const tokens = api.teamleader.refreshAccessToken.useQuery(refreshToken);
      if (tokens && tokens.data) {
        const expireDate = new Date(
          Date.now() + (tokens.data.expires_in - 600) * 1000,
        ).toString();
        Cookies.set("access_token", tokens.data.access_token, {
          expires: new Date(expireDate),
        });
        Cookies.set("refresh_token", tokens.data.refresh_token);
        Cookies.set("access_expires_at", expireDate);
      } else {
        console.error("Failed to refresh access token");
      }
    }
    return "";
  }

  console.log(geTLData());
  return (
    <div>
      We need this to be on the homepage, however at the moment this is for
      testing :D
    </div>
  );
}
