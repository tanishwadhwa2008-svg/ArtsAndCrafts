import { createApp } from './app.js';

const port = Number(process.env.API_PORT ?? 4000);
const host = process.env.API_HOST ?? 'localhost';

const app = createApp();

const server = app.listen(port, host, () => {
  console.warn(`[api] listening on http://${host}:${port}`);
});

// Graceful shutdown
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
