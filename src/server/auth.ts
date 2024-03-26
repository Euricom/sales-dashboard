import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type Session,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import { env } from "~/env";
import TeamleaderProvider from "./teamleaderProvider";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next" {
  /**
   * Used with withAuth helper is applied to a NextApiHandler
   */
  interface NextApiRequest {
    nextauth: {
      token: JWT;
      session: Session;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT {
    // default
    profile?: {
      name?: string;
      email?: string;
      picture?: string | null;
      sub?: string | null;
    };

    // extended
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    roles: string[];
    oid: string;
    iat: number;
    exp: number;
    jti: string;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop
   * on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    tokenExpiresAt: string;
    tokenExpiresIn: string;
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
    };
    token: JWT;
  }

  /** Azure AD Account */
  interface Account {
    provider: string;
    providerAccountId: string;
    token_type: "Bearer";
    scope: string;
    expires_at: number;
    ext_expires_in: number;
    access_token: string;
    id_token: string;
    session_state: string;
  }

  /** Teamleader Profile (id_token payload) */
  interface Profile {
    data: {
      first_name: string;
      last_name: string;
      email: string;
    };
  }
}

type RefreshTokenPayload =
  | {
      token_type: "Bearer";
      expires_in: number;
      access_token: string;
      refresh_token: string;
    }
  | {
      error: string;
      error_description: string;
      error_codes: number[];
      error_uri: string;
    };
/*
 * Takes a token, and returns a new token with updated
 * `accessToken` and `expiresAt`.
 */
const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token available.");
    }

    const response = await fetch(`${env.TEAMLEADER_ACCESS_TOKEN_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: `${env.TEAMLEADER_CLIENT_ID}`,
        client_secret: `${env.TEAMLEADER_CLIENT_SECRET}`,
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = (await response.json()) as RefreshTokenPayload;
    if ("error" in data) {
      throw new Error(`Failed to refresh accessToken: ${data.error}`);
    }
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to refresh token:", error.message);
    }
    // throwing the error will cause the session to be invalidated
    // and the user must re-login
    throw error;
  }
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // callbacks: {
  //   session: ({ session, user }) => ({
  //     ...session,
  //     user: {
  //       ...session.user,
  //       id: user.id,
  //     },
  //   }),
  // },
  session: {
    maxAge: 1 * 24 * 60 * 60, // 24h - should be the same as the refresh token lifetime
  },
  // adapter: PrismaAdapter(db),
  providers: [
    TeamleaderProvider({
      accessTokenUrl: env.TEAMLEADER_ACCESS_TOKEN_URL ?? "",
      clientId: env.TEAMLEADER_CLIENT_ID ?? "",
      clientSecret: env.TEAMLEADER_CLIENT_SECRET ?? "",
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  callbacks: {
    jwt: async function ({ token, account, profile }) {
      // console.log("jwt: %o", { account, profile });
      // Initial sign in
      if (profile && account) {
        const clockSkew = 60 * 10 * 1000; // 10 minutes
        const expiresAt = account.expires_at * 1000 - clockSkew; // ms

        // Update token object
        token.expiresAt = expiresAt;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.profile = {
          name: profile.data.first_name + " " + profile.data.last_name,
          email: profile.data.email,
        };
      }
      // Check if the access token has expired or about to expire
      if (Date.now() < token.expiresAt) {
        //console.log(token,"token in auth.ts callbacks")
        return token;
      }     
      return await refreshAccessToken(token);
    },
    session({ session, token }) {
      if (session.user) {
        // create session object
        session.user.name = token.profile?.name ?? "";
        session.user.email = token.profile?.email ?? "";
      }
      session.token = token;

      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        // httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
  // adapter: PrismaAdapter(db) as Adapter,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export type Role = "admin" | "user";
/**
 * Usages:
 * ```
 * const isAdmin = isInRole(user, 'admin');
 * const isAllowed = isInRole(user, ['admin', 'user']);
 * ```
 *
 * @returns true when the user has the given role or one of the roles
 */
export const isInRole = (
  user: Session["user"] | undefined,
  role: Role | Role[],
) => {
  const userRoles = user?.roles ?? [];
  if (Array.isArray(role)) {
    return role.some((r) => userRoles.includes(r));
  }
  return userRoles.includes(role);
};

/**
 * @returns true when the user is authenticated
 */
export const isAuthenticated = (session: Session) => !!session;

/**
 * Get a user from the session or return the anonymous user.
 */
export const getServerUser = async () => {
  const session = await getServerSession(authOptions);
  return getUser(session);
};

/**
 * User class with some helper methods to easy check roles and authentication.
 */
export class User {
  id: string;
  name: string;
  email: string;
  roles: string[];

  constructor(data: Session["user"]) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.roles = data.roles;
  }

  isInRole(role: Role | Role[]) {
    return isInRole(this, role);
  }

  get isAuthenticated() {
    return !!this.id;
  }
}

/**
 * Get a user from the session or return the anonymous user.
 * Simplifies the usage of the user object (never null)
 * @param session
 */
export const getUser = (session: Session | null) => {
  return new User(
    session?.user ?? {
      // anonymous user
      id: "",
      name: "anonymous",
      email: "",
      roles: [],
    },
  );
};
