import type { NextApiRequest, NextApiResponse } from "next";
import { fetchToken } from "~/utils/teamleader-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code } = req.query;
  try {
    if (!code || Array.isArray(code)) {
      throw new Error("Invalid code");
    }

    const tokens = await fetchToken(code);
    // Save the token to your preferred storage
    // For example, you can use cookies or localStorage
    if (tokens?.access_token && tokens.refresh_token) {
      const expireDate = new Date(
        Date.now() + (tokens.expires_in - 600) * 1000,
      ).toString();
      res.setHeader("Set-Cookie", [
        `access_token=${tokens.access_token}; Path=/; Expires=${expireDate}`,
        `refresh_token=${tokens.refresh_token}; Path=/;`,
        `access_expires_at=${expireDate}; Path=/;`,
      ]);
      res.redirect("/");
    } else {
      res.status(401).json({ error: "Token not valid", tokens });
    }
  } catch (error) {
    console.error("Error fetching token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
