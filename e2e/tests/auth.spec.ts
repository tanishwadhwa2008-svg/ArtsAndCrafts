import { test, expect } from '@playwright/test';

/**
 * Unauthenticated auth flows. Runs with a cleared storage state so the
 * shared authenticated session does not leak in.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test('redirects unauthenticated visitors to the login page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Seller Portal' })).toBeVisible();
});

test('shows a generic error on invalid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('seller@artisan.local');
  await page.getByLabel('Password').fill('WrongPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
