import { test, expect } from './fixtures.js';

/**
 * Catalog E2E. Every test creates its own uniquely-named data and removes it
 * again, so it never mutates existing seed/business records.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('product lifecycle: create → add variant → adjust stock → delete', async ({ page }) => {
  const suffix = Date.now();
  const title = `E2E Vase ${suffix}`;
  const slug = `e2e-vase-${suffix}`;
  const sku = `E2E-SKU-${suffix}`;

  // --- Create ---
  await page.goto('/products/new');
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByLabel('Slug').fill(slug);
  await page.getByLabel('Base price').fill('42.00');
  await page.getByRole('button', { name: 'Create product' }).click();

  // Redirects to the edit page once created.
  await expect(page.getByRole('heading', { name: 'Edit product' })).toBeVisible();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(title);

  // --- Add a variant (auto-provisions inventory) ---
  await page.getByPlaceholder('SKU-001').fill(sku);
  await page.getByPlaceholder('Default').fill('Standard');
  await page.getByRole('button', { name: 'Add variant' }).click();
  await expect(page.getByRole('cell', { name: sku })).toBeVisible();

  // --- Adjust the new variant's stock ---
  await page.goto('/inventory');
  const invRow = page.getByRole('row', { name: new RegExp(escapeRegExp(title)) });
  await invRow.getByRole('button', { name: 'Adjust stock' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Quantity on hand').fill('25');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Stock updated.')).toBeVisible();

  // --- Delete (cleanup) ---
  await page.goto('/products');
  const row = page.getByRole('row', { name: new RegExp(escapeRegExp(title)) });
  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Product deleted.')).toBeVisible();
  await expect(page.getByRole('cell', { name: title })).toHaveCount(0);
});

test('category lifecycle: create → delete', async ({ page }) => {
  const suffix = Date.now();
  const name = `E2E Category ${suffix}`;
  const slug = `e2e-category-${suffix}`;

  await page.goto('/categories');
  await page.getByRole('button', { name: 'New category' }).click();

  const form = page.getByRole('dialog');
  await form.getByLabel('Name').fill(name);
  await form.getByLabel('Slug').fill(slug);
  await form.getByRole('button', { name: 'Create category' }).click();

  await expect(page.getByRole('cell', { name })).toBeVisible();

  // Delete (cleanup).
  const row = page.getByRole('row', { name: new RegExp(escapeRegExp(name)) });
  await row.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Category deleted.')).toBeVisible();
  await expect(page.getByRole('cell', { name })).toHaveCount(0);
});

test('products list supports search', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

  // The seed catalog contains a stoneware mug.
  await page.getByPlaceholder('Search products…').fill('Stoneware');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('cell', { name: /stoneware/i })).toBeVisible();
});
