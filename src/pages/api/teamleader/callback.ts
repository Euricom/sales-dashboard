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

    const token = await fetchToken(code);
    console.log({ token });
    // Save the token to your preferred storage
    // For example, you can use cookies or localStorage
    // save to localstorage
    if (token) {
      localStorage.setItem("token", token);
      res.redirect("/");
      res.setHeader("Set-Cookie", `token=${token}; HttpOnly`);
    } else {
      res.status(401).json({ error: "Token not valid", token });
    }
  } catch (error) {
    console.error("Error fetching token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
