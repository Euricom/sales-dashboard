import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
        "You forgot to change the default URL",
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    AZURE_AD_CLIENT_ID: z.string().trim(),
    AZURE_AD_CLIENT_SECRET: z.string().trim(),
    AZURE_AD_TENANT_ID: z.string().trim(),
    AZURE_AD_GRAPH_API_BASE_URL_SUBSITE_LIST: z.string().trim(),
    TEAMLEADER_CLIENT_ID: z.string().trim(),
    TEAMLEADER_CLIENT_SECRET: z.string().trim(),
    TEAMLEADER_AUTHORIZATION_URL: z.string().trim(),
    TEAMLEADER_ACCESS_TOKEN_URL: z.string().trim(),
    TEAMLEADER_REDIRECT_URL: z.string().trim(),
    TEAMLEADER_API_URL: z.string().trim(),

    MAIL_USER: z.string().trim(),
    MAIL_PASS: z.string().trim(),
    MAIL_RECEIVER: z.string().trim(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
    AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET,
    AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,
    AZURE_AD_GRAPH_API_BASE_URL_SUBSITE_LIST:
      process.env.AZURE_AD_GRAPH_API_BASE_URL_SUBSITE_LIST,

    TEAMLEADER_CLIENT_ID: process.env.TEAMLEADER_CLIENT_ID,
    TEAMLEADER_CLIENT_SECRET: process.env.TEAMLEADER_CLIENT_SECRET,
    TEAMLEADER_AUTHORIZATION_URL: process.env.TEAMLEADER_AUTHORIZATION_URL,
    TEAMLEADER_ACCESS_TOKEN_URL: process.env.TEAMLEADER_ACCESS_TOKEN_URL,
    TEAMLEADER_REDIRECT_URL: process.env.TEAMLEADER_REDIRECT_URL,
    TEAMLEADER_API_URL: process.env.TEAMLEADER_API_URL,

    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASSWORD,
    MAIL_RECEIVER: process.env.MAIL_RECEIVER,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
