import { test, expect } from '@playwright/test'

test('practice journey: home → practice tab → answer → feedback', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Zbrojní kvíz' })).toBeVisible()

  // Go to the Practice tab, narrow to the smallest category, start.
  await page.getByRole('button', { name: 'Procvičovat' }).click()
  await page.getByRole('button', { name: /Zdravotnické minimum/ }).click()
  await page.screenshot({ path: 'e2e/shots/menu.png', fullPage: true })
  await page.getByRole('button', { name: 'Spustit procvičování' }).click()

  await expect(page.getByText('01 / 38')).toBeVisible()
  await page.locator('button[data-state="idle"]').first().click()
  await expect(page.locator('button[data-state="correct"]')).toBeVisible()
  await page.screenshot({ path: 'e2e/shots/feedback.png', fullPage: true })

  await page.getByRole('button', { name: /Další|Dokončit/ }).click()
  await expect(page.getByText('02 / 38')).toBeVisible()
})

test('daily lesson from home: 12 questions with completion + streak', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Dnešní lekce/ }).click()
  await expect(page.getByText('01 / 12')).toBeVisible()
  for (let i = 0; i < 12; i++) {
    await page.locator('button[data-state="idle"]').first().click()
    await page.getByRole('button', { name: /Další|Dokončit/ }).click()
  }
  await expect(page.getByText('Lekce dokončena')).toBeVisible()
  await expect(page.getByText(/den.*v řadě|dní.*v řadě/)).toBeVisible()
  // Results screen carries the feedback card — capture it for visual review.
  await expect(page.getByRole('button', { name: /Napiš autorovi/ })).toBeVisible()
  await page.screenshot({ path: 'e2e/shots/results.png', fullPage: true })
})

test('exam mode from practice tab: 60 questions with a timer', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Procvičovat' }).click()
  await page.getByRole('button', { name: /Zkušební test/ }).click()
  await expect(page.getByText('01 / 60')).toBeVisible()
  await expect(page.getByRole('timer')).toBeVisible()
  await page.locator('button[data-state="idle"]').first().click()
  await expect(page.locator('button[data-state="correct"]')).toHaveCount(0)
})

test('guide and stats tabs are reachable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Průvodce' }).click()
  await expect(page.getByRole('heading', { name: 'Studijní průvodce' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Kategorie zbraní/ })).toBeVisible()
  await page.getByRole('button', { name: 'Postup' }).click()
  await expect(page.getByRole('heading', { name: 'Statistiky' })).toBeVisible()
})
