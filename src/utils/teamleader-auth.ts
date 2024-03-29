import { env } from "~/env";
import { type Tokens } from "~/server/api/routers/teamleader/types";

export async function fetchToken(code: string): Promise<Tokens | undefined> {
  const options: RequestInit = {
    method: "POST",headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.TEAMLEADER_CLIENT_ID,
      client_secret: env.TEAMLEADER_CLIENT_SECRET,
      code: code, // Convert authCode to string
      grant_type: 'authorization_code',
      redirect_uri: env.TEAMLEADER_REDIRECT_URL,
    }),
  };

  try {
    const response = await fetch(env.TEAMLEADER_ACCESS_TOKEN_URL, options);
    // console.log({
    //   url: env.TEAMLEADER_ACCESS_TOKEN_URL,
    //   options,
    //   headers: response.headers,
    // });

    const data = await response.json() as Tokens;
    // console.log({ data, response });
    return data;
  } catch (error) {
    console.error(error);
  }
}
