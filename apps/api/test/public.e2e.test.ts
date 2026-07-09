import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

/**
 * Public storefront API (e2e). Read-only against existing seed data — creates
 * and deletes nothing. Verifies the endpoints require no authentication.
 */
const dbAvailable = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
const app = createApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe.skipIf(!dbAvailable)('public storefront API (e2e)', () => {
  it('serves the home feed without auth', async () => {
    const res = await request(app).get('/api/v1/public/home');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.collections)).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  it('lists active products without auth', async () => {
    const res = await request(app).get('/api/v1/public/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns a product by slug and 404 for an unknown one', async () => {
    const list = await request(app).get('/api/v1/public/products?limit=1');
    const first = list.body.data[0];
    if (first) {
      const res = await request(app).get(`/api/v1/public/products/${first.slug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(first.slug);
      expect(Array.isArray(res.body.data.images)).toBe(true);
      expect(typeof res.body.data.inStock).toBe('boolean');
    }
    const missing = await request(app).get('/api/v1/public/products/no-such-product-xyz');
    expect(missing.status).toBe(404);
  });

  it('lists published collections without auth', async () => {
    const res = await request(app).get('/api/v1/public/collections');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
