// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://8914e05c96606cf841e5a97f2959b15a@o4505997166247936.ingest.us.sentry.io/4507412341981184',
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.VERCEL_ENV ?? 'local',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
