import { api } from "~/utils/api";
import Cookies from "js-cookie";

export const updateTokensinCookies = () => {
  const refreshToken = Cookies.get("refresh_token");
  if (!refreshToken) {
    console.error("No refresh token found");
    return;
  }
  // if refresh token is present, refresh access token
  const tokens = api.teamleader.refreshAccessToken.useQuery(refreshToken);
  // update cookies with new tokens
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
};

export const getTeamleaderData = () => {
  // Get access token and expiration date from cookies
  const accessToken = Cookies.get("access_token");
  const expires_at = Cookies.get("access_expires_at");

  // If access token is present and not expired, get data
  if (accessToken && expires_at) {
    const expiresDate = new Date(expires_at);
    if (expiresDate > new Date()) {
      // Get deals data
      const dealsData = api.teamleader.getDealsData.useQuery(accessToken);
      return dealsData;
    } else {
      updateTokensinCookies();
    }
  }
};
