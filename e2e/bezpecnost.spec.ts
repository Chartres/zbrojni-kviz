import { test, expect } from '@playwright/test'
import questions from '../data/questions.json' with { type: 'json' }

// Persona: a first-time applicant on a phone. Their first lesson starts from what any careful
// person already knows (safe handling, first aid) before the dense licensing law.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

const SAFE = (id: number) => (id >= 562 && id <= 596) || (id >= 784 && id <= 799)
const FIRST_AID = (id: number) => id >= 800
const idOf = new Map(questions.map((q) => [q.q, q.id]))

test('new learner: first lesson opens with safe handling and leans on it, then completes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('První lekce začínají bezpečnou manipulací se zbraní a první pomocí.')).toBeVisible()
  await page.getByRole('button', { name: /Dnešní lekce/ }).click()
  await expect(page.getByText('01 / 12')).toBeVisible()
  await page.screenshot({ path: 'e2e/shots/m-first-lesson.png', fullPage: true })

  const ids: number[] = []
  for (let i = 0; i < 12; i++) {
    const stem = (await page.locator('article h2').textContent())!.trim()
    const id = idOf.get(stem)
    expect(id, `question text not in the bank: ${stem}`).toBeDefined()
    ids.push(id!)
    await page.locator('button[data-state="idle"]').first().click()
    await page.getByRole('button', { name: /^(Další|Dokončit)/ }).click()
  }
  expect(SAFE(ids[0])).toBe(true)
  expect(ids.filter(SAFE)).toHaveLength(5)
  expect(ids.filter((id) => SAFE(id) || FIRST_AID(id)).length).toBeGreaterThan(6)

  await expect(page.getByText('Lekce dokončena')).toBeVisible()
  await expect(page.getByText(/den.*v řadě|dní.*v řadě/)).toBeVisible()
})
