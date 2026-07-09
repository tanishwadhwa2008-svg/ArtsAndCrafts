import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

/**
 * End-to-end collections flow, run as the seeded shop owner. Skipped when the
 * database is unreachable or the seed seller (with a shop) is absent. All
 * created rows are tracked and hard-deleted afterwards (no seed data touched).
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
const createdCollectionIds: string[] = [];
const createdProductIds: string[] = [];

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

afterAll(async () => {
  if (dbAvailable) {
    if (createdCollectionIds.length) {
      await prisma.collection.deleteMany({ where: { id: { in: createdCollectionIds } } });
    }
    if (createdProductIds.length) {
      await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
    }
  }
  await prisma.$disconnect();
});

describe.skipIf(!sellerReady)('collections (e2e)', () => {
  let token = '';
  let collectionId = '';
  let productId = '';

  it('logs in as the seed seller', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seller@artisan.local', password: 'Seller123!Pass' });
    expect(res.status).toBe(200);
    token = res.body.data.accessToken;
    expect(token).toBeTruthy();
  });

  it('rejects unauthenticated collection access', async () => {
    const res = await request(app).get('/api/v1/collections');
    expect(res.status).toBe(401);
  });

  it('creates a draft collection', async () => {
    const res = await request(app)
      .post('/api/v1/collections')
      .set(auth(token))
      .send({ title: `Test Collection ${suffix}`, slug: `test-collection-${suffix}` });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.publishedAt).toBeNull();
    expect(res.body.data.products).toEqual([]);
    collectionId = res.body.data.id;
    createdCollectionIds.push(collectionId);
  });

  it('rejects a duplicate slug with 409', async () => {
    const res = await request(app)
      .post('/api/v1/collections')
      .set(auth(token))
      .send({ title: 'Dup', slug: `test-collection-${suffix}` });
    expect(res.status).toBe(409);
  });

  it('publishes the collection and stamps publishedAt', async () => {
    const res = await request(app)
      .patch(`/api/v1/collections/${collectionId}`)
      .set(auth(token))
      .send({ status: 'PUBLISHED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PUBLISHED');
    expect(res.body.data.publishedAt).toBeTruthy();
  });

  it('creates a product to attach', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(auth(token))
      .send({
        title: `Collection Product ${suffix}`,
        slug: `collection-product-${suffix}`,
        basePrice: '42.00',
        currency: 'USD',
        status: 'ACTIVE',
      });
    expect(res.status).toBe(201);
    productId = res.body.data.id;
    createdProductIds.push(productId);
  });

  it('sets the collection product membership', async () => {
    const res = await request(app)
      .put(`/api/v1/collections/${collectionId}/products`)
      .set(auth(token))
      .send({ productIds: [productId] });
    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].productId).toBe(productId);
    expect(res.body.data.products[0].position).toBe(0);
  });

  it('rejects products from outside the shop', async () => {
    const res = await request(app)
      .put(`/api/v1/collections/${collectionId}/products`)
      .set(auth(token))
      .send({ productIds: ['ckzzzzzzzzzzzzzzzzzzzzzzzz'] });
    expect(res.status).toBe(400);
  });

  it('lists collections with a product count', async () => {
    const res = await request(app).get('/api/v1/collections').set(auth(token));
    expect(res.status).toBe(200);
    const mine = res.body.data.find((c: { id: string }) => c.id === collectionId);
    expect(mine).toBeTruthy();
    expect(mine.productCount).toBe(1);
  });

  it('soft-deletes the collection', async () => {
    const del = await request(app)
      .delete(`/api/v1/collections/${collectionId}`)
      .set(auth(token));
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/v1/collections/${collectionId}`).set(auth(token));
    expect(get.status).toBe(404);
  });
});
