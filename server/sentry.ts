import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "https://your-sentry-dsn@sentry.io/project-id",
    environment: process.env.NODE_ENV || "development",
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    beforeSend(event) {
      // Filter out development noise
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry Event:', event.exception?.values?.[0]?.value || event.message);
      }
      return event;
    }
  });
}

export function captureError(error: Error, context?: any) {
  Sentry.withScope(scope => {
    if (context) {
      scope.setContext("additional_info", context);
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}