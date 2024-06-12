// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://8914e05c96606cf841e5a97f2959b15a@o4505997166247936.ingest.us.sentry.io/4507412341981184',
  // enabled: process.env.NODE_ENV === 'production',
  enabled: true,
  environment: process.env.VERCEL_ENV ?? 'local',
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: 'light',
    }),
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
