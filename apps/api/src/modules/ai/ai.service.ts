import type { AiCollectionDraftRequest, AiDraftProduct, AiDraftResult } from '@arts/shared';
import { slugify } from '@arts/shared';
import { env, isAiConfigured } from '../../config/env.js';
import { AppError, BadRequestError } from '../../lib/errors.js';
import { getObjectBytes } from '../../lib/storage.js';
import { prisma } from '../../db/prisma.js';
import { generateCollectionDraft, type ProviderImage } from './ai.provider.js';

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

function mimeFromKey(storageKey: string): string {
  const ext = storageKey.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ?? 'image/jpeg';
}

/**
 * Analyses the given (already-uploaded) images with the vision model and returns
 * an editable collection + per-image product draft. No database writes happen
 * here — the seller reviews/edits and prices this draft, then commits (Phase 3).
 */
export async function draftCollectionFromImages(
  shopId: string,
  input: AiCollectionDraftRequest,
): Promise<AiDraftResult> {
  if (!isAiConfigured) {
    throw new AppError('AI bulk upload is not configured', {
      statusCode: 503,
      code: 'AI_UNAVAILABLE',
    });
  }

  if (input.images.length > env.AI_MAX_IMAGES) {
    throw new BadRequestError(`At most ${env.AI_MAX_IMAGES} images can be analysed at once`);
  }

  // Anti-SSRF: every object must live under this shop's storage prefix, so a
  // caller can never make the server read another shop's (or arbitrary) objects.
  const prefix = `shops/${shopId}/`;
  for (const image of input.images) {
    if (!image.storageKey.startsWith(prefix)) {
      throw new BadRequestError('One or more images do not belong to this shop');
    }
  }

  // Read each image back from storage and base64-encode it for the provider.
  const providerImages: ProviderImage[] = [];
  for (const image of input.images) {
    const { body, contentType } = await getObjectBytes(image.storageKey);
    providerImages.push({
      base64: body.toString('base64'),
      mimeType: contentType ?? mimeFromKey(image.storageKey),
    });
  }

  // Ground the model in the shop's existing categories so it prefers them
  // (proposing a new one only when nothing fits).
  const categories = await prisma.category.findMany({
    where: { shopId, deletedAt: null },
    select: { name: true },
    orderBy: { name: 'asc' },
  });

  const raw = await generateCollectionDraft(
    providerImages,
    categories.map((category) => category.name),
  );

  // Map AI products to images by index (deduping), guaranteeing exactly one
  // product per selected image, in order, with server-derived slugs.
  const byIndex = new Map<number, (typeof raw.products)[number]>();
  for (const product of raw.products) {
    if (product.imageIndex < input.images.length && !byIndex.has(product.imageIndex)) {
      byIndex.set(product.imageIndex, product);
    }
  }

  const products: AiDraftProduct[] = input.images.map((image, index) => {
    const drafted = byIndex.get(index);
    const title = (drafted?.title ?? '').trim() || `Item ${index + 1}`;
    const category = drafted?.categoryName?.trim();
    const metaTitle = drafted?.metaTitle?.trim();
    const metaDescription = drafted?.metaDescription?.trim();
    return {
      imageIndex: index,
      storageKey: image.storageKey,
      url: image.url,
      title,
      slug: slugify(title),
      description: (drafted?.description ?? '').trim(),
      categoryName: category ? category : null,
      altText: (drafted?.altText ?? '').trim() || title,
      metaTitle: metaTitle ? metaTitle : null,
      metaDescription: metaDescription ? metaDescription : null,
    };
  });

  const collectionTitle = raw.collection.title.trim() || 'New collection';

  return {
    collection: {
      title: collectionTitle,
      slug: slugify(collectionTitle),
      description: (raw.collection.description ?? '').trim(),
    },
    products,
  };
}
