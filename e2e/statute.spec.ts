import { test, expect } from '@playwright/test'

// Persona: a learner who wants to see the law itself after answering. On a phone the provision
// reads as a printed excerpt: § reference, book serif, act in italic; the app's voice stays sans.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

const serif = (el: Element) => getComputedStyle(el).fontFamily

test('statute serif: the cited provision is set like a printed statute excerpt', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Procvičovat' }).click()
  await page.getByPlaceholder(/Zúžit hledáním/).fill('Pro nošení zbraně platí')
  await page.getByRole('button', { name: 'Spustit procvičování' }).click()
  await expect(page.getByText('01 / 1')).toBeVisible()
  await page.locator('button[data-state="idle"]').first().click()

  const note = page.getByRole('region', { name: 'Zdroj: § 80 odst. 1' })
  await expect(note).toBeVisible()
  await expect(note.locator('.statute-ref')).toHaveText('§ 80 odst. 1')
  const quote = note.locator('.statute')
  await expect(quote).toContainText('Zbraň musí být nošena skrytě')
  expect(await quote.evaluate(serif)).toContain('IBM Plex Serif')
  // CI has network: the webfont itself must load, not just be declared.
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.fonts.check('17px "IBM Plex Serif"'))).toBe(true)
  expect(await page.locator('article h2').evaluate(serif)).toContain('IBM Plex Sans')
  expect(await note.locator('.statute-act').evaluate((el) => getComputedStyle(el).fontStyle)).toBe('italic')
  // The quote must not push the page sideways on a phone.
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await note.scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'e2e/shots/m-statute.png', fullPage: true })
})

test('statute serif on the static question page and /zkouska/, without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  for (const path of ['/otazka/322/', '/zkouska/']) {
    await page.goto(path)
    const quote = page.locator('blockquote.statute').first()
    await expect(quote).toBeVisible()
    expect(await quote.evaluate(serif)).toContain('IBM Plex Serif')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  }
  await ctx.close()
})
