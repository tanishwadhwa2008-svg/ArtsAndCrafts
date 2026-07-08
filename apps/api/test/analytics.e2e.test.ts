import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

/**
 * Analytics summary e2e, run as the seeded shop owner. Skipped when the
 * database is unreachable or the seed seller (with a shop) is absent.
 * Read-only — creates and deletes nothing.
 */
const dbAvailable = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

const sellerReady = dbAvailable
  ? await prisma.user
      .findFirst({ where: { email: 'seller@artisan.local', shopId: { not: null } } })
      .then((u) => Boolean(u))
      .catch(() => false)
  : false;

const app = createApp();

describe.skipIf(!sellerReady)('analytics summary (e2e)', () => {
  let token = '';

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/analytics/summary');
    expect(res.status).toBe(401);
  });

  it('logs in as the seed seller', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seller@artisan.local', password: 'Seller123!Pass' });
    expect(res.status).toBe(200);
    token = res.body.data.accessToken;
    expect(token).toBeTruthy();
  });

  it('returns a well-formed analytics summary', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/summary')
      .set({ Authorization: `Bearer ${token}` });

    expect(res.status).toBe(200);
    const data = res.body.data;

    expect(typeof data.products.total).toBe('number');
    expect(data.products.byStatus).toEqual(
      expect.objectContaining({
        DRAFT: expect.any(Number),
        ACTIVE: expect.any(Number),
        ARCHIVED: expect.any(Number),
      }),
    );
    expect(typeof data.categories.total).toBe('number');
    expect(typeof data.variants.total).toBe('number');
    expect(typeof data.inventory.totalUnits).toBe('number');
    expect(typeof data.inventory.lowStockCount).toBe('number');
    expect(Array.isArray(data.inventory.valueByCurrency)).toBe(true);
    expect(Array.isArray(data.productsByCategory)).toBe(true);

    // Status counts must sum to the product total.
    const statusSum =
      data.products.byStatus.DRAFT +
      data.products.byStatus.ACTIVE +
      data.products.byStatus.ARCHIVED;
    expect(statusSum).toBe(data.products.total);

    // Money values are serialized as fixed-precision strings.
    for (const entry of data.inventory.valueByCurrency) {
      expect(typeof entry.currency).toBe('string');
      expect(entry.value).toMatch(/^\d+\.\d{2}$/);
    }
  });
});
