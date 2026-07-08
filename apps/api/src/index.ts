import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './db/prisma.js';

const app = createApp();

// Last-resort process-level safety nets. An unhandled rejection is logged;
// an uncaught exception leaves the process in an unknown state, so we log and
// exit to let the orchestrator restart a clean instance.
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception — exiting');
  process.exit(1);
});

const server = app.listen(env.API_PORT, env.API_HOST, () => {
  logger.info(`API listening on http://${env.API_HOST}:${env.API_PORT}`);
});

/**
 * Graceful shutdown: stop accepting connections, then release the database
 * pool. A hard timeout guarantees the process eventually exits even if a
 * connection hangs.
 */
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down...`);

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Shutdown complete');
    process.exit(0);
  });
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
