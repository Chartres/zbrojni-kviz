import { test, expect, devices } from '@playwright/test'

// Personas: Jana, a shooting instructor running a November course, and Petr, her learner, each on
// a phone. Jana makes a class code; Petr joins by her link, practises, and sends her where he
// stands. Nothing goes through a server: the link carries the summary, Jana's phone keeps the class.
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }

test('instructor creates a class; learner joins by link, sends a summary; it lands on the instructor page', async ({ browser }) => {
  const jana = await (await browser.newContext(phone)).newPage()
  const petr = await (await browser.newContext({ ...phone, permissions: [] })).newPage()

  await jana.goto('/instruktor/?ref=k01')
  await expect(jana.getByRole('heading', { name: 'Pro instruktory' })).toBeVisible()
  await jana.getByLabel('Název kurzu (jen pro vás)').fill('Kurz listopad')
  await jana.getByRole('button', { name: 'Vytvořit kód třídy' }).click()
  const joinUrl = await jana.getByLabel('Odkaz pro žáky').inputValue()
  expect(joinUrl).toMatch(/\/\?trida=[A-Z2-9]{3}-[A-Z2-9]{3}$/)

  // Petr opens the join link and practises a little.
  await petr.goto(new URL(joinUrl).pathname + new URL(joinUrl).search)
  await petr.getByRole('button', { name: /Dnešní lekce/ }).click()
  for (let i = 0; i < 3; i++) {
    await petr.locator('button[data-state="idle"]').first().click()
    await petr.getByRole('button', { name: /^(Další|Dokončit)/ }).click()
  }
  await petr.getByRole('button', { name: /Konec/ }).click()
  await petr.getByRole('navigation', { name: 'Hlavní navigace' }).getByRole('button', { name: /Postup/ }).click()
  await expect(petr.getByLabel('Kód třídy od instruktora')).toHaveValue(new URL(joinUrl).searchParams.get('trida')!)
  await petr.getByLabel('Jméno pro instruktora').fill('Petr Novák')
  await petr.getByRole('button', { name: 'Uložit' }).click()
  await petr.getByRole('button', { name: 'Poslat instruktorovi' }).click()
  const summaryUrl = await petr.getByLabel('Odkaz pro instruktora').inputValue()
  expect(summaryUrl).toMatch(/\/instruktor\/#z1\./)
  await petr.getByRole('region', { name: 'Instruktor' }).scrollIntoViewIfNeeded()
  await petr.screenshot({ path: 'e2e/shots/m-learner-send.png' })

  // Jana opens Petr's link on her phone.
  await jana.goto(new URL(summaryUrl).pathname + new URL(summaryUrl).hash)
  await expect(jana.getByRole('status')).toContainText('Přidáno: Petr Novák')
  const list = jana.getByRole('list', { name: /^Žáci třídy/ })
  await expect(list.getByText('Petr Novák')).toBeVisible()
  await expect(list).toContainText('3 / 837')
  expect(await jana.evaluate(() => window.location.hash)).toBe('')
  const width = await jana.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(390)
  await jana.screenshot({ path: 'e2e/shots/m-instructor-class.png', fullPage: true })
})
