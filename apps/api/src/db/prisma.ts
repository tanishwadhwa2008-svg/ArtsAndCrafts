import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * In development, `tsx watch` reloads modules frequently; caching the client
 * on `globalThis` prevents exhausting the database connection pool with a new
 * client on every reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
