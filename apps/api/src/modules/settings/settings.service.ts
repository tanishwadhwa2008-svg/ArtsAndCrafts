import type { Prisma, StorefrontSettings } from '@prisma/client';
import type { UpdateStorefrontSettingsInput } from '@arts/shared';
import { prisma } from '../../db/prisma.js';

/**
 * Storefront settings service. Each shop has a single settings row; it is
 * lazily created on first read so callers always get a value. Scoped by
 * `shopId` (OWASP A01) — a seller can only read/write their own settings.
 */

/** Get-or-create the settings singleton for a shop. */
export async function getOrCreateSettings(shopId: string): Promise<StorefrontSettings> {
  const existing = await prisma.storefrontSettings.findUnique({ where: { shopId } });
  if (existing) return existing;
  return prisma.storefrontSettings.create({ data: { shopId } });
}

export async function updateSettings(
  shopId: string,
  input: UpdateStorefrontSettingsInput,
): Promise<StorefrontSettings> {
  await getOrCreateSettings(shopId);
  return prisma.storefrontSettings.update({
    where: { shopId },
    data: {
      ...(input.contact !== undefined
        ? { contact: input.contact as Prisma.InputJsonValue }
        : {}),
    },
  });
}
