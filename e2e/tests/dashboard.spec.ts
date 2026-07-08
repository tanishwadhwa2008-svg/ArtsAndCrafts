import { test, expect } from './fixtures.js';

/**
 * Authenticated dashboard checks (logs in fresh via the fixture).
 */
test('dashboard renders live metrics and charts', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Stat cards (labels are unique to the dashboard, unlike "Products").
  await expect(page.getByText('Units On Hand')).toBeVisible();
  await expect(page.getByText('Inventory Value')).toBeVisible();
  await expect(page.getByText('Low Stock')).toBeVisible();

  // Charts.
  await expect(page.getByRole('heading', { name: 'Products by status' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Products by category' })).toBeVisible();
});

test('session persists across a full reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.reload();

  // Silent refresh restores the session — no bounce back to /login.
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
