import { test, expect } from './fixtures.js';

/**
 * Collections E2E (seller portal). Creates its own uniquely-named collection
 * and deletes it at the end, so no seed/business data is mutated. Products from
 * the seed catalogue are attached and detached — the products themselves are
 * never modified (removing a member only drops the join row).
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('collection lifecycle: create → publish → add/reorder/remove products → delete', async ({
  page,
}) => {
  const suffix = Date.now();
  const title = `E2E Collection ${suffix}`;
  const slug = `e2e-collection-${suffix}`;

  // --- Create (defaults to DRAFT) ---
  await page.goto('/collections/new');
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByLabel('Slug').fill(slug);
  await page.getByRole('button', { name: 'Create collection' }).click();

  // Redirects to the edit page once created.
  await expect(page.getByRole('heading', { name: 'Edit collection' })).toBeVisible();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(title);

  // --- Publish (stamps publishedAt server-side) ---
  await page.getByLabel('Status').selectOption('PUBLISHED');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Collection saved.')).toBeVisible();

  // --- Add a first product from the seed catalogue ---
  await expect(page.getByText('No products in this collection yet.')).toBeVisible();
  await page.getByLabel('Add product').selectOption({ index: 1 });
  await expect(page.getByText('Product added.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(1);

  // --- Add a second product (picker now excludes the first) ---
  await page.getByLabel('Add product').selectOption({ index: 1 });
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(2);

  // --- Reorder: move the first product down ---
  await page.getByRole('button', { name: 'Move down' }).first().click();
  await expect(page.getByText('Order updated.')).toBeVisible();

  // --- Remove one product ---
  await page.getByRole('button', { name: 'Remove' }).first().click();
  await expect(page.getByText('Product removed.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(1);

  // --- Delete the collection (cleanup; cascades the remaining join row) ---
  await page.goto('/collections');
  const row = page.getByRole('row', { name: new RegExp(escapeRegExp(title)) });
  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Collection deleted.')).toBeVisible();
  await expect(page.getByRole('cell', { name: title })).toHaveCount(0);
});
