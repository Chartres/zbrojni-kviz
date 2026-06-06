import { test, expect } from '@playwright/test'

test('practice journey: menu → answer → feedback → results', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Zbrojní oprávnění' })).toBeVisible()

  // Narrow to the smallest category for a quick run.
  await page.getByRole('button', { name: /Zdravotnické minimum/ }).click()
  await page.screenshot({ path: 'test-results/menu.png', fullPage: true })

  await page.getByRole('button', { name: /Procvičování/ }).click()

  // Answer the first question (option a) and expect immediate feedback.
  await expect(page.getByText(/1 \/ 38/)).toBeVisible()
  await page.locator('button[data-state="idle"]').first().click()
  await expect(
    page.locator('button[data-state="correct"]'),
  ).toBeVisible()
  await page.screenshot({ path: 'test-results/feedback.png', fullPage: true })

  // Advance.
  await page.getByRole('button', { name: /Další|Dokončit/ }).click()
  await expect(page.getByText(/2 \/ 38/)).toBeVisible()
})

test('exam mode starts 60 questions with a timer', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Zkušební test/ }).click()
  await expect(page.getByText(/1 \/ 60/)).toBeVisible()
  await expect(page.getByRole('timer')).toBeVisible()
  // No correctness revealed in exam mode after answering.
  await page.locator('button[data-state="idle"]').first().click()
  await expect(page.locator('button[data-state="correct"]')).toHaveCount(0)
})

test('study guide and stats are reachable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Studijní průvodce' }).click()
  await expect(page.getByRole('heading', { name: 'Studijní průvodce' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Kategorie zbraní', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: '← Zpět' }).click()
  await page.getByRole('button', { name: 'Statistiky' }).click()
  await expect(page.getByRole('heading', { name: 'Statistiky' })).toBeVisible()
})
