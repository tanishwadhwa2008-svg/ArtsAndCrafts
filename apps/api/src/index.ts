import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './db/prisma.js';

const app = createApp();

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
