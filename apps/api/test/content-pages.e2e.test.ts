import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

/**
 * End-to-end content-pages + blocks flow, run as the seeded shop owner. Block
 * and page operations are performed on a self-created CUSTOM page (hard-deleted
 * afterwards); the singleton HOME page is only read (get-or-create), so no real
 * homepage content is mutated.
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
const createdPageIds: string[] = [];
const createdCollectionIds: string[] = [];

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

afterAll(async () => {
  if (dbAvailable) {
    if (createdPageIds.length) {
      await prisma.contentPage.deleteMany({ where: { id: { in: createdPageIds } } });
    }
    if (createdCollectionIds.length) {
      await prisma.collection.deleteMany({ where: { id: { in: createdCollectionIds } } });
    }
  }
  await prisma.$disconnect();
});

describe.skipIf(!sellerReady)('content pages & blocks (e2e)', () => {
  let token = '';
  let pageId = '';
  let heroId = '';
  let richTextId = '';
  let collectionId = '';

  it('logs in as the seed seller', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seller@artisan.local', password: 'Seller123!Pass' });
    expect(res.status).toBe(200);
    token = res.body.data.accessToken;
    expect(token).toBeTruthy();
  });

  it('rejects unauthenticated content access', async () => {
    const res = await request(app).get('/api/v1/content/home');
    expect(res.status).toBe(401);
  });

  it('get-or-creates the singleton HOME page', async () => {
    const res = await request(app).get('/api/v1/content/home').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe('HOME');
    expect(Array.isArray(res.body.data.blocks)).toBe(true);
  });

  it('creates a custom content page', async () => {
    const res = await request(app)
      .post('/api/v1/content/pages')
      .set(auth(token))
      .send({ title: `E2E Page ${suffix}`, slug: `e2e-page-${suffix}` });
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('CUSTOM');
    expect(res.body.data.status).toBe('DRAFT');
    pageId = res.body.data.id;
    createdPageIds.push(pageId);
  });

  it('adds a HERO block', async () => {
    const res = await request(app)
      .post(`/api/v1/content/pages/${pageId}/blocks`)
      .set(auth(token))
      .send({ type: 'HERO', payload: { eyebrow: 'Artisan', heading: 'Welcome' } });
    expect(res.status).toBe(201);
    expect(res.body.data.blocks).toHaveLength(1);
    expect(res.body.data.blocks[0].type).toBe('HERO');
    heroId = res.body.data.blocks[0].id;
  });

  it('rejects an invalid block payload', async () => {
    const res = await request(app)
      .post(`/api/v1/content/pages/${pageId}/blocks`)
      .set(auth(token))
      .send({ type: 'HERO', payload: { eyebrow: 'no heading' } });
    expect(res.status).toBe(422);
  });

  it('adds a RICH_TEXT block', async () => {
    const res = await request(app)
      .post(`/api/v1/content/pages/${pageId}/blocks`)
      .set(auth(token))
      .send({ type: 'RICH_TEXT', payload: { heading: 'Our story', body: 'Lorem ipsum.' } });
    expect(res.status).toBe(201);
    expect(res.body.data.blocks).toHaveLength(2);
    richTextId = res.body.data.blocks[1].id;
  });

  it('reorders blocks', async () => {
    const res = await request(app)
      .put(`/api/v1/content/pages/${pageId}/blocks/order`)
      .set(auth(token))
      .send({ blockIds: [richTextId, heroId] });
    expect(res.status).toBe(200);
    expect(res.body.data.blocks[0].id).toBe(richTextId);
    expect(res.body.data.blocks[1].id).toBe(heroId);
  });

  it('updates a block payload', async () => {
    const res = await request(app)
      .patch(`/api/v1/content/pages/${pageId}/blocks/${heroId}`)
      .set(auth(token))
      .send({ type: 'HERO', payload: { heading: 'Welcome, updated' } });
    expect(res.status).toBe(200);
    const hero = res.body.data.blocks.find((b: { id: string }) => b.id === heroId);
    expect(hero.payload.heading).toBe('Welcome, updated');
  });

  it('rejects changing a block type', async () => {
    const res = await request(app)
      .patch(`/api/v1/content/pages/${pageId}/blocks/${heroId}`)
      .set(auth(token))
      .send({ type: 'RICH_TEXT', payload: { body: 'nope' } });
    expect(res.status).toBe(400);
  });

  it('validates referenced collections in a FEATURED_COLLECTIONS block', async () => {
    const collection = await request(app)
      .post('/api/v1/collections')
      .set(auth(token))
      .send({ title: `E2E Ref Collection ${suffix}`, slug: `e2e-ref-collection-${suffix}` });
    expect(collection.status).toBe(201);
    collectionId = collection.body.data.id;
    createdCollectionIds.push(collectionId);

    const ok = await request(app)
      .post(`/api/v1/content/pages/${pageId}/blocks`)
      .set(auth(token))
      .send({ type: 'FEATURED_COLLECTIONS', payload: { collectionIds: [collectionId] } });
    expect(ok.status).toBe(201);

    const bad = await request(app)
      .post(`/api/v1/content/pages/${pageId}/blocks`)
      .set(auth(token))
      .send({ type: 'FEATURED_COLLECTIONS', payload: { collectionIds: ['ckzzzzzzzzzzzzzzzzzzzzzzzz'] } });
    expect(bad.status).toBe(400);
  });

  it('deletes a block', async () => {
    const res = await request(app)
      .delete(`/api/v1/content/pages/${pageId}/blocks/${heroId}`)
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.blocks.find((b: { id: string }) => b.id === heroId)).toBeUndefined();
  });

  it('publishes the page and stamps publishedAt', async () => {
    const res = await request(app)
      .patch(`/api/v1/content/pages/${pageId}`)
      .set(auth(token))
      .send({ status: 'PUBLISHED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PUBLISHED');
    expect(res.body.data.publishedAt).toBeTruthy();
  });

  it('refuses to delete the HOME page', async () => {
    const home = await request(app).get('/api/v1/content/home').set(auth(token));
    const homeId = home.body.data.id;
    const res = await request(app).delete(`/api/v1/content/pages/${homeId}`).set(auth(token));
    expect(res.status).toBe(400);
  });
});
