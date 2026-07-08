import { pino } from 'pino';
import { env } from '../config/env.js';

/**
 * Application logger (pino).
 *
 * - Structured JSON by default (machine-parseable, ready for log shipping).
 * - Pretty, colorized output only in development for readability.
 * - Redacts common sensitive fields so secrets never reach the logs
 *   (OWASP A09 — logging done safely).
 */
const usePrettyTransport = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
  transport: usePrettyTransport
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
