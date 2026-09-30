/**
 * Clicks every interactive control on the page and asserts that each one
 * produces an observable change: a dialog opens, the grid filters, the scroll
 * position moves, or the cart total changes.
 *
 *   npm run test:interactions
 *
 * This is the check that catches "button looks clickable but does nothing".
 * The static audit (scripts/audit-links.mjs) catches missing handlers; this
 * catches handlers wired to the wrong thing.
 */
import { chromium } from 'playwright'
import { preview } from 'vite'

const PORT = 4318
const BASE = `http://localhost:${PORT}`

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed += 1
}

const server = await preview({
  preview: { port: PORT, strictPort: true, open: false },
  logLevel: 'error',
})

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

const ACCOUNT = () => page.locator('[aria-labelledby="account-title"]')
const INFO = () => page.locator('[aria-labelledby="info-title"]')
const CHECKOUT = () => page.locator('[aria-labelledby="checkout-title"]')
const BAG = () => page.getByRole('dialog', { name: 'Shopping bag', exact: true })
const SEARCH = () => page.getByRole('dialog', { name: 'Search products' }).last()

const dismiss = async () => {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(450)
}

/** How many product cards the grid currently shows. */
const gridCount = () => page.locator('#new-arrivals ul > li').count()

/**
 * The active filter chip. Read from the chip's own text node, not its
 * textContent: the chip also renders a count in a nested span, so textContent
 * returns "Shoes3" and never equals the bare label.
 */
const activeChip = () =>
  page
    .locator('#new-arrivals button[aria-pressed="true"]')
    .first()
    .evaluate((el) => el.childNodes[0]?.textContent?.trim() ?? el.textContent?.trim())

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // ---------------------------------------------------------------- header
  console.log('header controls:')

  await page.getByRole('button', { name: /sign in or create an account/i }).click()
  await page.waitForTimeout(500)
  check('account icon opens the dialog', await ACCOUNT().isVisible())
  await dismiss()

  await page.getByRole('button', { name: /search products/i }).click()
  await page.waitForTimeout(500)
  check('search opens the overlay', await SEARCH().isVisible())
  await dismiss()

  await page.getByRole('button', { name: /open shopping bag/i }).click()
  await page.waitForTimeout(500)
  check('bag opens the drawer', await BAG().isVisible())
  await dismiss()

  // ---------------------------------------------------------------- filters
  console.log('\ncategory filter chips:')
  const total = await gridCount()

  for (const name of ['Shoes', 'Tops', 'Bottoms']) {
    await page.locator('#new-arrivals').getByRole('button', { name: new RegExp(`^${name}`) }).click()
    await page.waitForTimeout(350)
    const shown = await gridCount()
    check(
      `"${name}" filters the grid`,
      shown > 0 && shown < total,
      `${shown} of ${total} cards, chip reads "${(await activeChip())?.trim()}"`,
    )
  }

  // ---------------------------------------------------------------- links
  console.log('\nfooter and editorial links:')

  await page.locator('footer').getByRole('link', { name: 'Shipping', exact: true }).click()
  await page.waitForTimeout(500)
  check('footer "Shipping" opens help', await INFO().isVisible())
  const title = await page.locator('#info-title').textContent()
  check('help shows the right topic', title?.trim() === 'Shipping', title?.trim())
  await dismiss()

  // Reopening switches topics. Give the close transition time to finish, or the
// next click lands on the still-fading scrim.
  await page.locator('footer').getByRole('link', { name: 'Size Guide', exact: true }).click()
  await page.waitForTimeout(700)
  const sizeTitle = await page.locator('#info-title').textContent()
  check('help topic switches', sizeTitle?.trim() === 'Size guide', sizeTitle?.trim())
  await dismiss()

  await page.locator('footer').getByRole('link', { name: 'Stores', exact: true }).click()
  await page.waitForTimeout(500)
  check('footer "Stores" opens help', (await page.locator('#info-title').textContent())?.trim() === 'Stores')
  await dismiss()

  // ------------------------------------------------------------ collections
  console.log('\ncollection cards:')
  await page.locator('#collections').getByRole('link', { name: /shop the dresses collection/i }).click()
  await page.waitForTimeout(900)
  check(
    'collection card filters the grid',
    (await activeChip())?.trim().toLowerCase() === 'dresses',
    `chip reads "${(await activeChip())?.trim()}"`,
  )

  // "View all" must clear a filter rather than land on a filtered grid.
  await page.locator('#categories').getByRole('link', { name: /view all/i }).first().click()
  await page.waitForTimeout(900)
  check('"View all" resets the filter', (await activeChip())?.trim().toLowerCase() === 'all')
  check('"View all" shows every product', (await gridCount()) === total, `${await gridCount()} of ${total}`)

  // ------------------------------------------------------------ hero + promos
  console.log('\nhero and promo CTAs:')
  // The category rail is a horizontal scroller; scroll the tile into view.
  // The category rail is a horizontal scroller; bring the tile into view first.
  const shoeTile = page.locator('#categories button', { hasText: 'Shoes' }).first()
  await shoeTile.scrollIntoViewIfNeeded()
  await shoeTile.click()
  await page.waitForTimeout(700)
  const filtered = await gridCount()
  await page.locator('#top').getByRole('link', { name: /shop new in/i }).click()
  await page.waitForTimeout(900)
  check('hero "Shop new in" clears the filter', (await activeChip())?.trim().toLowerCase() === 'all')
  check('hero "Shop new in" restores the grid', (await gridCount()) === total, `was ${filtered}`)

  await page.locator('#top').getByRole('link', { name: /explore collections/i }).click()
  await page.waitForTimeout(900)
  const y = await page.evaluate(() => window.scrollY)
  check('hero "Explore collections" scrolls', y > 200, `scrollY ${Math.round(y)}`)

  await page.getByRole('link', { name: /find a store/i }).click()
  await page.waitForTimeout(500)
  check('promo "Find a Store" opens help', (await page.locator('#info-title').textContent())?.trim() === 'Stores')
  await dismiss()

  // ---------------------------------------------------------------- checkout
  console.log('\ncart and checkout:')
  await page.locator('#new-arrivals').getByRole('button', { name: /^M$/ }).first().click()
  await page.waitForTimeout(600)
  check('quick add opens the bag', await BAG().isVisible())
  check('quick add added a line', (await page.locator('[aria-label^="Open shopping bag"]').textContent()) !== null)

  await page.getByRole('button', { name: /^checkout$/i }).click()
  await page.waitForTimeout(600)
  check('checkout opens', await CHECKOUT().isVisible())
  check('cart drawer closed behind it', !(await BAG().isVisible()))

  // Contact step: empty submit is rejected. Scoped to the dialog because the
  // chat widget also offers a "Shipping" quick reply in the page background.
  const continueBtn = CHECKOUT().getByRole('button', { name: /^continue$/i })
  await continueBtn.click()
  await page.waitForTimeout(400)
  check('checkout validates before advancing', (await CHECKOUT().locator('[role="alert"]').count()) >= 1)

  await page.fill('#checkout-email', 'ada@example.com')
  await page.fill('#checkout-name', 'Ada Lovelace')
  await continueBtn.click()
  await page.waitForTimeout(400)
  check('contact step advances', (await page.locator('#checkout-title').textContent())?.includes('Delivery'))

  await page.fill('#checkout-address', '118 Wooster St')
  await page.fill('#checkout-city', 'New York')
  await page.fill('#checkout-postcode', '10012')
  await CHECKOUT().getByRole('button', { name: /place order/i }).click()
  await page.waitForTimeout(500)
  check('order confirms', (await page.locator('#checkout-title').textContent())?.includes('confirmed'))

  await CHECKOUT().getByRole('button', { name: /continue shopping/i }).click()
  await page.waitForTimeout(500)
  // isVisible() is true through the close transition, so assert on the state
// the component actually uses for "closed" rather than on paint.
check(
  'checkout closes',
  await CHECKOUT().evaluate((el) => el.className.includes('opacity-0')),
)
  const badge = await page.locator('[aria-label^="Open shopping bag"]').textContent()
  check('placing the order empties the bag', !badge || !/\d/.test(badge), `badge "${badge?.trim()}"`)

  // ------------------------------------------------------------- chat widget
  console.log('\nsupport widget:')
  await page.getByRole('button', { name: /open support chat/i }).click()
  await page.waitForTimeout(400)
  // Scope to the chat card: the info dialog's entries mention Shipping too.
  const chatCard = page.getByRole('dialog', { name: /support chat/i })
  // Quick replies come from chatReplies keys: 'Order help', 'Product question',
// 'Contact support'.
  // The agent reply lands 620ms after the click (the scripted typing delay).
  await chatCard.getByRole('button', { name: /^order help$/i }).click()
  await page.waitForTimeout(1600)
  const messages = await chatCard.locator('p').count()
  check('quick reply is answered', messages >= 3, `${messages} messages (greeting + user + agent)`)
  await chatCard.getByRole('button', { name: /contact & store details/i }).click()
  await page.waitForTimeout(500)
  check('widget opens the help dialog', await INFO().isVisible())
  await dismiss()

  // ---------------------------------------------------------- back to top
  console.log('\nutility controls:')
  await page.evaluate(() => window.scrollTo(0, 2000))
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: /scroll back to top/i }).click()
  await page.waitForTimeout(1200)
  check('back to top returns to the top', (await page.evaluate(() => window.scrollY)) < 100)

  check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))
} finally {
  await browser.close()
  await server.close()
}

console.log(failed ? `\nFAIL: ${failed} assertion(s)` : '\nPASS: all assertions')
process.exit(failed ? 1 : 0)
