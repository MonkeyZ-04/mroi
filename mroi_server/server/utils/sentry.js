import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { GENERAL } from "@configs";

const { NODE_ENV, SERVICE_NAME, SERVICE_VERSION, SENTRY_ENDPOINT } = GENERAL.default;
export const sentryInitiate = (app) => {
  Sentry.init({
    dsn: SENTRY_ENDPOINT,
    environment: NODE_ENV,
    release: `${SERVICE_NAME}@${SERVICE_VERSION}`,
    integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
    tracesSampleRate: 1.0,
  });
};
export default Sentry;
