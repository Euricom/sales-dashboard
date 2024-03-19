import type { OAuthUserConfig } from "next-auth/providers/oauth";
import { env } from "~/env";
export interface TeamleaderProfile {
  data: {
    id: string;
    account: {
      type: string;
      id: string;
    };
  };
  first_name: string;
  last_name: string;
  email: string;
  email_verification_status: string;
  language: string;
  telephones: string[];
  function: string;
  time_zone: string;
  avatar_url: string | null;
  preferences: {
    invoiceable: boolean;
    historic_timeline_cracking_limit: string | null;
    whitelabeling: boolean;
  };
}

export default function Teamleader<P extends TeamleaderProfile>(
  options: OAuthUserConfig<P>,
) {
  return {
    ...options, // Spread options to ensure all required fields are included
    id: "teamleader",
    name: "Teamleader",
    type: "oauth" as const, // Set type to "oauth" explicitly
    version: "2.0",
    authorization: {
      url: env.TEAMLEADER_AUTHORIZATION_URL,
      params: {
        scope: "companies users",
        redirect_uri: env.TEAMLEADER_REDIRECT_URL,
        response_type: "code",
      },
    },
    token: {
      url: env.TEAMLEADER_ACCESS_TOKEN_URL,
      params: {
        scope: "users",
        response_type: "code",
      },
    },
    userinfo: {
      url: "https://api.teamleader.eu/users.me",
    },
    profile: (profile: TeamleaderProfile) => {
      return {
        id: profile.data.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        image: profile.avatar_url,
      };
    },
  };
}
