import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('health', () => {
  it('GET /health reports the process is healthy', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(typeof res.body.data.uptime).toBe('number');
  });

  it('sets an x-request-id response header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });
});

describe('api v1', () => {
  it('GET /api/v1 returns the API descriptor', async () => {
    const res = await request(app).get('/api/v1');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.version).toBe('v1');
  });
});

describe('error handling', () => {
  it('returns a consistent 404 envelope for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nope');

    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(typeof res.body.error.message).toBe('string');
  });

  it('applies security headers via helmet', async () => {
    const res = await request(app).get('/health');
    // helmet sets this; also confirms x-powered-by is stripped.
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
