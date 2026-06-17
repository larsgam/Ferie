import { expect, test } from '@playwright/test'

test('logged-out visitor is redirected to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Log ind' })).toBeVisible()
})

test('login page shows the email form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByPlaceholder('din@email.dk')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send login-link' })).toBeVisible()
})
