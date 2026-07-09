import type { ContentPage, Prisma } from '@prisma/client';
import type {
  ContentBlockInput,
  ContentPageListQuery,
  CreateContentPageInput,
  UpdateContentPageInput,
} from '@arts/shared';
import { prisma } from '../../../db/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../../lib/errors.js';

/**
 * Content-page service. Pages (home / story / custom) are shop-scoped, own an
 * ordered list of typed blocks, and follow the draft/publish workflow. Every
 * query excludes soft-deleted rows and is scoped to `shopId` (OWASP A01).
 */

const listInclude = {
  _count: { select: { blocks: true } },
} satisfies Prisma.ContentPageInclude;

export type ContentPageListRow = Prisma.ContentPageGetPayload<{ include: typeof listInclude }>;

const detailInclude = {
  blocks: { orderBy: { position: 'asc' } },
} satisfies Prisma.ContentPageInclude;

export type ContentPageDetailRow = Prisma.ContentPageGetPayload<{ include: typeof detailInclude }>;

export function listContentPages(
  shopId: string,
  query: ContentPageListQuery,
): Promise<ContentPageListRow[]> {
  return prisma.contentPage.findMany({
    where: {
      shopId,
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    include: listInclude,
  });
}

export async function getContentPage(shopId: string, id: string): Promise<ContentPageDetailRow> {
  const page = await prisma.contentPage.findFirst({
    where: { id, shopId, deletedAt: null },
    include: detailInclude,
  });
  if (!page) {
    throw new NotFoundError('Content page not found');
  }
  return page;
}

/** Returns the shop's singleton HOME page, provisioning (or restoring) it. */
export async function getOrCreateHome(shopId: string): Promise<ContentPageDetailRow> {
  const existing = await prisma.contentPage.findFirst({ where: { shopId, slug: 'home' } });

  if (existing) {
    if (existing.deletedAt || existing.type !== 'HOME') {
      await prisma.contentPage.update({
        where: { id: existing.id },
        data: { deletedAt: null, type: 'HOME' },
      });
    }
    return getContentPage(shopId, existing.id);
  }

  const created = await prisma.contentPage.create({
    data: { shopId, type: 'HOME', slug: 'home', title: 'Home', status: 'DRAFT' },
  });
  return getContentPage(shopId, created.id);
}

async function findPageOrThrow(shopId: string, id: string): Promise<ContentPage> {
  const page = await prisma.contentPage.findFirst({ where: { id, shopId, deletedAt: null } });
  if (!page) {
    throw new NotFoundError('Content page not found');
  }
  return page;
}

async function assertSlugAvailable(shopId: string, slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.contentPage.findFirst({
    where: { shopId, slug, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) {
    throw new ConflictError('A page with this slug already exists');
  }
}

export async function createContentPage(
  shopId: string,
  input: CreateContentPageInput,
): Promise<ContentPage> {
  await assertSlugAvailable(shopId, input.slug);
  return prisma.contentPage.create({
    data: {
      shopId,
      title: input.title,
      slug: input.slug,
      type: input.type,
      status: input.status,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    },
  });
}

export async function updateContentPage(
  shopId: string,
  id: string,
  input: UpdateContentPageInput,
): Promise<ContentPage> {
  const current = await findPageOrThrow(shopId, id);

  if (input.slug && input.slug !== current.slug) {
    await assertSlugAvailable(shopId, input.slug, id);
  }

  const publishedAt =
    input.status === 'PUBLISHED' && current.publishedAt === null ? new Date() : undefined;

  return prisma.contentPage.update({
    where: { id },
    // `type` is intentionally immutable after creation.
    data: {
      title: input.title,
      slug: input.slug,
      status: input.status,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      ...(publishedAt ? { publishedAt } : {}),
    },
  });
}

export async function deleteContentPage(shopId: string, id: string): Promise<void> {
  const page = await findPageOrThrow(shopId, id);
  if (page.type === 'HOME') {
    throw new BadRequestError('The homepage cannot be deleted');
  }
  await prisma.contentPage.update({ where: { id }, data: { deletedAt: new Date() } });
}

/** Validates that a block's referenced collections/products belong to the shop. */
async function assertBlockRefs(shopId: string, input: ContentBlockInput): Promise<void> {
  if (input.type === 'FEATURED_COLLECTIONS') {
    const ids = [...new Set(input.payload.collectionIds)];
    if (ids.length > 0) {
      const count = await prisma.collection.count({
        where: { id: { in: ids }, shopId, deletedAt: null },
      });
      if (count !== ids.length) {
        throw new BadRequestError('One or more collections do not exist in this shop');
      }
    }
  } else if (input.type === 'PRODUCT_GRID') {
    const ids = [...new Set(input.payload.productIds)];
    if (ids.length > 0) {
      const count = await prisma.product.count({
        where: { id: { in: ids }, shopId, deletedAt: null },
      });
      if (count !== ids.length) {
        throw new BadRequestError('One or more products do not exist in this shop');
      }
    }
  }
}

export async function addBlock(
  shopId: string,
  pageId: string,
  input: ContentBlockInput,
): Promise<ContentPageDetailRow> {
  await findPageOrThrow(shopId, pageId);
  await assertBlockRefs(shopId, input);

  const max = await prisma.contentBlock.aggregate({
    where: { pageId },
    _max: { position: true },
  });
  const position = (max._max.position ?? -1) + 1;

  await prisma.contentBlock.create({
    data: {
      pageId,
      type: input.type,
      payload: input.payload as Prisma.InputJsonValue,
      position,
    },
  });
  return getContentPage(shopId, pageId);
}

export async function updateBlock(
  shopId: string,
  pageId: string,
  blockId: string,
  input: ContentBlockInput,
): Promise<ContentPageDetailRow> {
  await findPageOrThrow(shopId, pageId);
  const block = await prisma.contentBlock.findFirst({ where: { id: blockId, pageId } });
  if (!block) {
    throw new NotFoundError('Block not found');
  }
  if (block.type !== input.type) {
    throw new BadRequestError('A block type cannot be changed');
  }
  await assertBlockRefs(shopId, input);

  await prisma.contentBlock.update({
    where: { id: blockId },
    data: { payload: input.payload as Prisma.InputJsonValue },
  });
  return getContentPage(shopId, pageId);
}

export async function deleteBlock(
  shopId: string,
  pageId: string,
  blockId: string,
): Promise<ContentPageDetailRow> {
  await findPageOrThrow(shopId, pageId);
  const block = await prisma.contentBlock.findFirst({ where: { id: blockId, pageId } });
  if (!block) {
    throw new NotFoundError('Block not found');
  }
  await prisma.contentBlock.delete({ where: { id: blockId } });
  return getContentPage(shopId, pageId);
}

export async function reorderBlocks(
  shopId: string,
  pageId: string,
  blockIds: string[],
): Promise<ContentPageDetailRow> {
  await findPageOrThrow(shopId, pageId);

  const blocks = await prisma.contentBlock.findMany({ where: { pageId }, select: { id: true } });
  const pageBlockIds = new Set(blocks.map((b) => b.id));
  const isExactSet =
    blockIds.length === pageBlockIds.size && blockIds.every((id) => pageBlockIds.has(id));
  if (!isExactSet) {
    throw new BadRequestError('blockIds must contain exactly the blocks of this page');
  }

  await prisma.$transaction(
    blockIds.map((id, index) =>
      prisma.contentBlock.update({ where: { id }, data: { position: index } }),
    ),
  );
  return getContentPage(shopId, pageId);
}
