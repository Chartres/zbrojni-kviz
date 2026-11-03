import { test, expect } from '@playwright/test'

// Persona: an applicant on a phone, practising the law okruh. The options are long and differ by
// a word or two. They turn on "Zvýraznit rozdíly" and see where the options differ, without being
// told which is right. The mock exam stays as the real test: three unmarked options.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

test('practice: turn on Zvýraznit rozdíly, see the dotted marks; remembered; never in the mock exam', async ({ page }) => {
  await page.goto('/okruh/zakon-o-zbranich/')
  const sw = page.getByRole('button', { name: 'Zvýraznit rozdíly' })
  await expect(sw).toHaveAttribute('aria-pressed', 'false')
  expect((await sw.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await expect(page.locator('[data-diff-mark]')).toHaveCount(0)
  await sw.click()
  await expect(sw).toHaveAttribute('aria-pressed', 'true')

  // Find a question whose options share text (most do); answer and move on otherwise.
  for (let i = 0; i < 15 && (await page.locator('[data-diff-mark]').count()) === 0; i++) {
    await page.locator('button[data-state="idle"]').first().click()
    await page.getByRole('button', { name: /^(Další|Dokončit)/ }).click()
  }
  const marks = page.locator('[data-diff-mark]')
  expect(await marks.count()).toBeGreaterThan(0)
  await expect(marks.first()).toHaveCSS('text-decoration-style', 'dotted')
  await expect(page.getByText('Vyznačena jsou slova, ve kterých se možnosti liší. Která je správná, neříká.')).toBeVisible()
  await page.screenshot({ path: 'e2e/shots/m-reading-aid.png', fullPage: true })

  // Answering hands over to the usual feedback: the aid and its marks go away.
  await page.locator('button[data-state="idle"]').first().click()
  await expect(sw).toHaveCount(0)
  await expect(marks).toHaveCount(0)

  // Remembered on this device; never offered in the mock exam.
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Hlavní navigace' }).getByRole('button', { name: /Procvičovat/ }).click()
  await page.getByRole('button', { name: /^Zkušební test/ }).click()
  await expect(page.locator('article')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Zvýraznit rozdíly' })).toHaveCount(0)
  await expect(page.locator('[data-diff-mark]')).toHaveCount(0)
  await page.getByRole('button', { name: /Konec/ }).click()
  await page.getByRole('button', { name: /Dnešní lekce/ }).click()
  await expect(page.getByRole('button', { name: 'Zvýraznit rozdíly' })).toHaveAttribute('aria-pressed', 'true')
})
