import { test, expect } from '@playwright/test'

// Persona: Lucie, studying for the licence in short gaps on her phone. She opts in to Otázka dne,
// answers today's question on the tram, and sees it done for today with the count of days in a
// row, kept on her phone. Nothing nags her the next day.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

test('opt in to Otázka dne, answer it, back home: done for today, streak 1, still there after reload', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('region', { name: 'Otázka dne' })
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'Zapojit se' }).click()
  await card.getByRole('button', { name: /Odpovědět/ }).click()

  await expect(page.getByText('Otázka dne', { exact: true })).toBeVisible() // quiz header label
  await expect(page.locator('article header span').first()).toHaveText('01 / 1')
  await page.locator('button[data-state="idle"]').first().click()
  await page.getByRole('button', { name: /^Dokončit/ }).click()

  await expect(card).toContainText('Dnes hotovo')
  await expect(card).toContainText('1 den v řadě')
  await expect(card.getByRole('button', { name: /Odpovědět/ })).toHaveCount(0)
  await page.screenshot({ path: 'e2e/shots/m-otazka-dne.png' })

  await page.reload()
  await expect(page.getByRole('region', { name: 'Otázka dne' })).toContainText('Dnes hotovo')
  // the lesson streak is the lesson's: answering the question of the day does not move it
  await expect(page.getByText(/0\s*dní v řadě/).first()).toBeVisible()
})
