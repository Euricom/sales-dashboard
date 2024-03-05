import { env } from "~/env";

export async function fetchToken(code: string): Promise<string | undefined> {
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: `{
      "client_id":${env.TEAMLEADER_CLIENT_ID},
      "client_secret":${env.TEAMLEADER_CLIENT_SECRET},
      "code": ${code},
      "grant_type":"authorization_code",
      "redirect_uri":${env.TEAMLEADER_REDIRECT_URL}}`,
  };

  try {
    const response = await fetch(env.TEAMLEADER_ACCESS_TOKEN_URL, options);
    console.log({
      url: env.TEAMLEADER_ACCESS_TOKEN_URL,
      options,
      headers: response.headers,
    });

    const data = await response.json();
    console.log({ data, response });
    return data.access_token;
  } catch (error) {
    console.error(error);
  }
}
