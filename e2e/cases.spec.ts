import { test, expect } from '@playwright/test'

// Persona: an applicant who carries for self-defence and wants to know where nutná obrana ends.
// On a phone they open the case, read the situation, answer, and see the rule and § 29.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

test('case method: nutná obrana — situation, then rule, then provision, to the end', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Procvičovat' }).click()
  await expect(page.getByRole('heading', { name: 'Případy' })).toBeVisible()
  await page.getByRole('button', { name: /^Nutná obrana/ }).click()

  await expect(page.getByText('01 / 12')).toBeVisible()
  const situation = page.getByRole('region', { name: 'Situace' })
  await expect(situation).toContainText('Případ · Nutná obrana')
  await expect(page.getByRole('region', { name: 'Pravidlo' })).toHaveCount(0)

  await page.locator('button[data-state="idle"]').first().click()
  await expect(page.getByRole('region', { name: 'Pravidlo' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Zdroj: § 29 odst. 1' })).toContainText('není trestným činem')
  await expect(page.getByRole('button', { name: /^(Další|Dokončit)/ })).toBeInViewport()
  await page.screenshot({ path: 'e2e/shots/m-case.png', fullPage: true })

  for (let i = 0; i < 12; i++) {
    if (i > 0) await page.locator('button[data-state="idle"]').first().click()
    await page.getByRole('button', { name: /^(Další|Dokončit)/ }).click()
  }
  await expect(page.getByText(/\/ 12/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Zpět na rozcestník' })).toBeVisible()
})
