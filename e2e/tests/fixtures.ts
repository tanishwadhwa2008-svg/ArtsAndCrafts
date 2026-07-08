import { test as base, expect } from '@playwright/test';

/**
 * Authenticated test fixture.
 *
 * Logs in through the UI before each test and hands back a page already on the
 * dashboard. A fresh login per test is deliberate: the API rotates refresh
 * tokens on every use (single-use), so a shared/saved session cannot be reused.
 */
export const SELLER_EMAIL = 'seller@artisan.local';
export const SELLER_PASSWORD = 'Seller123!Pass';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(SELLER_EMAIL);
    await page.getByLabel('Password').fill(SELLER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await use(page);
  },
});

export { expect };
