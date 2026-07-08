import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

/**
 * End-to-end catalog / inventory / media flow, run as the seeded shop owner.
 * Skipped when the database is unreachable or the seed seller (with a shop)
 * is absent. All created rows are tracked and hard-deleted afterwards.
 */
const dbAvailable = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

const sellerReady = dbAvailable
  ? await prisma.user
      .findFirst({ where: { email: 'seller@artisan.local', shopId: { not: null } } })
      .then((u) => Boolean(u))
      .catch(() => false)
  : false;

const app = createApp();
const suffix = Date.now();
const createdProductIds: string[] = [];
const createdCategoryIds: string[] = [];

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

afterAll(async () => {
  if (dbAvailable) {
    if (createdProductIds.length) {
      await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
    }
    if (createdCategoryIds.length) {
      await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
    }
  }
  await prisma.$disconnect();
});

describe.skipIf(!sellerReady)('catalog, inventory & media (e2e)', () => {
  let token = '';
  let categoryId = '';
  let productId = '';
  let variantId = '';

  it('logs in as the seed seller', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seller@artisan.local', password: 'Seller123!Pass' });
    expect(res.status).toBe(200);
    token = res.body.data.accessToken;
    expect(token).toBeTruthy();
  });

  it('rejects unauthenticated catalog access', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(401);
  });

  it('creates a category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(auth(token))
      .send({ name: `Test Cat ${suffix}`, slug: `test-cat-${suffix}` });
    expect(res.status).toBe(201);
    categoryId = res.body.data.id;
    createdCategoryIds.push(categoryId);
  });

  it('creates a product and returns money as a string', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(auth(token))
      .send({
        title: `Test Product ${suffix}`,
        slug: `test-prod-${suffix}`,
        basePrice: '19.99',
        currency: 'USD',
        status: 'ACTIVE',
        categoryId,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.basePrice).toBe('19.99');
    productId = res.body.data.id;
    createdProductIds.push(productId);
  });

  it('rejects an unsupported currency', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(auth(token))
      .send({
        title: 'Bad',
        slug: `test-prod-bad-${suffix}`,
        basePrice: '10',
        currency: 'DOLLARS',
      });
    expect(res.status).toBe(422);
  });

  it('adds a variant that gets an inventory row', async () => {
    const res = await request(app)
      .post(`/api/v1/products/${productId}/variants`)
      .set(auth(token))
      .send({ sku: `TEST-SKU-${suffix}`, name: 'Default', price: '19.99' });
    expect(res.status).toBe(201);
    expect(res.body.data.inventory.quantity).toBe(0);
    variantId = res.body.data.id;
  });

  it('adjusts inventory and bumps the version', async () => {
    const res = await request(app)
      .patch(`/api/v1/inventory/${variantId}`)
      .set(auth(token))
      .send({ setQuantity: 25 });
    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(25);
    expect(res.body.data.version).toBe(1);
  });

  it('rejects a stale optimistic inventory update', async () => {
    const res = await request(app)
      .patch(`/api/v1/inventory/${variantId}`)
      .set(auth(token))
      .send({ adjustBy: 5, expectedVersion: 0 });
    expect(res.status).toBe(409);
  });

  it('lists products with pagination metadata', async () => {
    const res = await request(app).get('/api/v1/products?pageSize=5').set(auth(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.meta.pageSize).toBe(5);
  });

  it('returns 404 for a well-formed but unknown product id', async () => {
    const res = await request(app)
      .get('/api/v1/products/cjld2cjxh0000qzrmn831i7rn')
      .set(auth(token));
    expect(res.status).toBe(404);
  });

  it('issues a presigned media upload URL', async () => {
    const res = await request(app)
      .post('/api/v1/media/upload-url')
      .set(auth(token))
      .send({ fileName: 'photo.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.data.uploadUrl).toContain('http');
    expect(res.body.data.storageKey).toContain('shops/');
  });

  it('soft-deletes a product (then 404 on fetch)', async () => {
    const del = await request(app).delete(`/api/v1/products/${productId}`).set(auth(token));
    expect(del.status).toBe(204);
    const after = await request(app).get(`/api/v1/products/${productId}`).set(auth(token));
    expect(after.status).toBe(404);
  });
});
