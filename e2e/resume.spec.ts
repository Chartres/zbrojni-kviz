import { test, expect, type Page } from '@playwright/test'

// Persona: an applicant on a phone, on the tram. They get through 8 of the 12 questions, have
// to get off, and come back later. The 8 answers count; the lesson waits on the home screen
// and Pokračovat picks it up at question 9, with the same questions in the same order.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

const counter = (page: Page) => page.locator('article header span').first()
// The bank repeats some stems with different options, so a question is its stem plus its options.
const stem = async (page: Page) =>
  [
    (await page.locator('article h2').textContent())!.trim(),
    ...(await page.locator('article button[data-state]').allTextContents()),
  ].join(' | ')

async function answerAndNext(page: Page) {
  await page.locator('button[data-state="idle"]').first().click()
  await page.getByRole('button', { name: /^(Další|Dokončit)/ }).click()
}

test('leave a lesson at 8 of 12, come back, Pokračovat at question 9, finish', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Dnešní lekce/ }).click()
  await expect(counter(page)).toHaveText('01 / 12')

  const stems: string[] = []
  for (let i = 0; i < 8; i++) {
    stems.push(await stem(page))
    await answerAndNext(page)
  }
  await expect(counter(page)).toHaveText('09 / 12')
  const ninth = await stem(page)
  await page.getByRole('button', { name: /Konec/ }).click()

  // Later: the app is opened again from scratch.
  await page.reload()
  await expect(page.getByText('Rozpracovaná lekce')).toBeVisible()
  await expect(page.getByRole('heading', { name: /8 \/ 12 zodpovězeno/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nový trénink' })).toBeVisible()
  await expect(page.getByTestId('stat-answered')).toHaveText('8')
  await page.screenshot({ path: 'e2e/shots/m-home-pokracovat.png', fullPage: true })

  await page.getByRole('button', { name: /Pokračovat/ }).click()
  await expect(counter(page)).toHaveText('09 / 12')
  expect(await stem(page)).toBe(ninth)
  expect(stems).not.toContain(ninth)
  await page.screenshot({ path: 'e2e/shots/m-lesson-resumed.png', fullPage: true })

  for (let i = 0; i < 4; i++) await answerAndNext(page)
  await expect(page.getByText('Lekce dokončena')).toBeVisible()
  await page.getByRole('button', { name: 'Zpět na rozcestník' }).click()
  await expect(page.getByText('Rozpracovaná lekce')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Dnešní lekce/ })).toBeVisible()
})

test('Nový trénink replaces the unfinished lesson and skips what was answered', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Dnešní lekce/ }).click()
  const answered: string[] = []
  for (let i = 0; i < 8; i++) {
    answered.push(await stem(page))
    await answerAndNext(page)
  }
  await page.getByRole('button', { name: /Konec/ }).click()
  await page.getByRole('button', { name: 'Nový trénink' }).click()
  await expect(counter(page)).toHaveText('01 / 12')
  const fresh: string[] = []
  for (let i = 0; i < 12; i++) {
    fresh.push(await stem(page))
    await answerAndNext(page)
  }
  // Only the spaced-repetition share (at most 4 of 12) may bring an answered question back.
  expect(fresh.filter((s) => answered.includes(s)).length).toBeLessThanOrEqual(4)
})
