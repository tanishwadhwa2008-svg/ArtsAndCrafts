import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

/**
 * Per-request structured logging with a stable request id.
 *
 * The request id is taken from an inbound `x-request-id` header when present
 * (useful for tracing across services) or generated, and echoed back on the
 * response so clients and logs can be correlated (OWASP A09).
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const header = req.headers['x-request-id'];
    const id = (Array.isArray(header) ? header[0] : header) ?? randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
