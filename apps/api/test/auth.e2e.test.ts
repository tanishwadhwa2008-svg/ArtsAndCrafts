import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

/**
 * End-to-end auth flow against the real database. Skipped automatically when
 * the database is unreachable so unit tests remain runnable in isolation. All
 * data is scoped to a unique throwaway email and cleaned up afterwards.
 */
const dbAvailable = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

const app = createApp();
const email = `test+${Date.now()}@example.test`;
const password = 'Str0ngPassw0rd!';

interface Extracted {
  refreshLine: string;
  csrfLine: string;
  csrfValue: string;
}

function extractCookies(setCookie: string[] | undefined): Extracted {
  const cookies = setCookie ?? [];
  const refreshLine = cookies.find((c) => c.startsWith('refresh_token='))?.split(';')[0] ?? '';
  const csrfLine = cookies.find((c) => c.startsWith('csrf_token='))?.split(';')[0] ?? '';
  const csrfValue = csrfLine.split('=')[1] ?? '';
  return { refreshLine, csrfLine, csrfValue };
}

afterAll(async () => {
  if (dbAvailable) {
    await prisma.user.deleteMany({ where: { email } });
  }
  await prisma.$disconnect();
});

describe.skipIf(!dbAvailable)('auth flow (e2e)', () => {
  let accessToken = '';
  let first: Extracted;
  let second: Extracted;

  it('rejects a weak password on register', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email, password: 'weak' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('registers a new seller and sets auth cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password, displayName: 'Test Seller' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.role).toBe('SELLER');
    expect(res.body.data.accessToken).toBeTruthy();

    accessToken = res.body.data.accessToken;
    first = extractCookies(res.headers['set-cookie']);
    expect(first.refreshLine).toContain('refresh_token=');
    expect(first.csrfValue).toBeTruthy();
  });

  it('rejects a duplicate registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email, password });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns the current user from /me with a valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects refresh without a CSRF header', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [first.refreshLine, first.csrfLine]);
    expect(res.status).toBe(403);
  });

  it('rotates tokens on refresh', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [first.refreshLine, first.csrfLine])
      .set('x-csrf-token', first.csrfValue);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    second = extractCookies(res.headers['set-cookie']);
    expect(second.refreshLine).not.toBe(first.refreshLine);
  });

  it('detects reuse of a rotated (revoked) refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [first.refreshLine, first.csrfLine])
      .set('x-csrf-token', first.csrfValue);
    expect(res.status).toBe(401);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('rejects login with a wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassw0rd!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('logs out and clears cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [second.refreshLine, second.csrfLine])
      .set('x-csrf-token', second.csrfValue);
    expect(res.status).toBe(204);
  });
});
