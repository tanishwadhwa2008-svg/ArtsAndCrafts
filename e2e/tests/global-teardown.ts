import path from 'node:path';
import { Client } from 'pg';

/**
 * Global teardown: hard-purges ONLY the rows the E2E suite creates.
 *
 * UI-driven tests can only soft-delete (the app never hard-deletes from the
 * browser), so test rows would otherwise accumulate on the dev database. This
 * runs once after the whole suite and removes rows whose slug starts with the
 * test prefix `e2e-` (products `e2e-vase-…`, categories `e2e-category-…`,
 * collections `e2e-collection-…`). No seed/business slug uses that prefix, so
 * real data is never touched. Failures here are logged, not fatal.
 */
async function globalTeardown(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    try {
      // e2e/tests → repo root → apps/api/.env (same DB the tests exercise).
      process.loadEnvFile(path.join(import.meta.dirname, '..', '..', 'apps', 'api', '.env'));
    } catch {
      /* fall back to the ambient environment */
    }
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('[e2e teardown] DATABASE_URL not set — skipping test-data cleanup.');
    return;
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();

    // Collections first (cascades their join rows), then products (cascades
    // variants/images/inventory/join rows), then categories. Only `e2e-` slugs.
    const collections = await client.query("DELETE FROM collections WHERE slug LIKE $1", ['e2e-%']);
    const products = await client.query("DELETE FROM products WHERE slug LIKE $1", ['e2e-%']);
    const categories = await client.query("DELETE FROM categories WHERE slug LIKE $1", ['e2e-%']);

    console.log(
      `[e2e teardown] purged test rows — collections: ${collections.rowCount ?? 0}, ` +
        `products: ${products.rowCount ?? 0}, categories: ${categories.rowCount ?? 0}`,
    );
  } catch (error) {
    console.warn('[e2e teardown] cleanup skipped:', (error as Error).message);
  } finally {
    await client.end().catch(() => {});
  }
}

export default globalTeardown;
