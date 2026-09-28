/**
 * End-to-end test of the account dialog in a real browser.
 *
 *   npm run test:account:flow
 *
 * Starts the production preview server, then drives the sign-up / sign-in /
 * sign-out flow with Playwright and asserts the behaviour that static markup
 * cannot check: that a session survives a reload, that the focus trap holds,
 * that Escape closes the dialog, and that no console errors are logged.
 *
 * Requires a one-off browser download:
 *   npx playwright install chromium
 */
import { chromium } from 'playwright'
import { preview } from 'vite'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PORT = 4319
const BASE = `http://localhost:${PORT}`
const SHOTS = process.env.SCREENSHOT_DIR
  ?? join(dirname(fileURLToPath(import.meta.url)), '..', '.screenshots')

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed += 1
}

const server = await preview({
  preview: { port: PORT, strictPort: true, open: false },
  logLevel: 'error',
})

mkdirSync(SHOTS, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

/** The app renders five role=dialog nodes; always address the account one. */
// Scoped by attribute, not by role+name: a closed dialog carries aria-hidden,
// which drops it out of the accessibility tree, so a role locator cannot be
// used to assert on the *closed* state.
const ACCOUNT = () => page.locator('[aria-labelledby="account-title"]')

const openDialog = async () => {
  await page.getByRole('button', { name: /sign in or create an account/i }).click()
  await page.waitForTimeout(600)
}
const shot = (name) => page.screenshot({ path: join(SHOTS, `${name}.png`) })

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // --- sign in mode -------------------------------------------------------
  await openDialog()
  check('dialog opened', await ACCOUNT().isVisible())
  check('heading reads "Welcome back"', (await page.locator('#account-title').textContent())?.trim() === 'Welcome back')
  check('sign-in shows 2 fields', (await page.locator('#account-panel input').count()) === 2)
  await shot('01-signin')

  // Empty submit surfaces inline errors rather than a native bubble.
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.waitForTimeout(400)
  const alerts = await page.getByRole('alert').allTextContents()
  check('empty submit shows errors', alerts.length === 2, alerts.map((a) => a.trim()).join(' | '))
  await shot('02-errors')

  // --- create account mode ----------------------------------------------
  await page.getByRole('tab', { name: /create account/i }).click()
  await page.waitForTimeout(600)
  check('create-account shows 4 fields', (await page.locator('#account-panel input').count()) === 4)
  await shot('03-signup')

  // Mismatched confirmation is rejected.
  await page.fill('#account-name', 'Ada Lovelace')
  await page.fill('#account-email', 'ada@example.com')
  await page.fill('#account-password', 'abcd1234')
  await page.fill('#account-confirmPassword', 'abcd9999')
  await page.getByRole('button', { name: /create account/i }).last().click()
  await page.waitForTimeout(400)
  const mismatch = (await page.getByRole('alert').allTextContents()).join(' ')
  check('password mismatch rejected', /do not match/i.test(mismatch), mismatch.trim())
  check('still on the form', (await page.locator('#account-panel').count()) === 1)

  // Corrected -> signed in.
  await page.fill('#account-confirmPassword', 'abcd1234')
  await page.getByRole('button', { name: /create account/i }).last().click()
  await page.waitForTimeout(900)
  check('sign-up succeeds', (await page.locator('#account-title').textContent())?.includes('signed in'))
  check('email shown on the panel', (await page.locator('dd').first().textContent())?.trim() === 'Ada Lovelace')
  await shot('04-signed-in')

  // --- session survives a reload ----------------------------------------
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /signed in as/i }).click()
  await page.waitForTimeout(600)
  check(
    'session restored after reload',
    (await page.locator('#account-title').textContent())?.includes('signed in'),
  )

  // Sign out returns to the form.
  await page.getByRole('button', { name: /sign out/i }).click()
  await page.waitForTimeout(500)
  check('sign out returns to the form', (await page.locator('#account-panel').count()) === 1)
  check(
    'header icon is signed-out again',
    await page.getByRole('button', { name: /sign in or create an account/i }).isVisible(),
  )
  await shot('05-after-signout')

  // Sign out swaps the panel but leaves the dialog open, so close it explicitly
  // before reopening - otherwise the scrim intercepts the next click.
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  // --- overlay behaviour --------------------------------------------------
  await openDialog()
  for (let i = 0; i < 14; i += 1) await page.keyboard.press('Tab')
  check(
    'focus stays trapped after 14 tabs',
    await page.evaluate(() =>
      Boolean(
        document.activeElement?.closest('[aria-labelledby="account-title"]'),
      ),
    ),
  )

  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check(
    'escape closes the dialog',
    await ACCOUNT().evaluate((el) => el.className.includes('opacity-0')),
  )

  // --- mobile -------------------------------------------------------------
  // The header account icon is md:inline-flex, so below md the entry point is
  // the mobile menu instead.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: /open navigation menu/i }).click()
  await page.waitForTimeout(600)
  check(
    'mobile menu offers a sign-in entry',
    await page.getByRole('button', { name: /sign in/i }).isVisible(),
  )
  await shot('06-mobile-menu')

  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.waitForTimeout(700)
  check('dialog fits a 390px viewport', await ACCOUNT().isVisible())
  const overflows = await ACCOUNT().evaluate((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
  check('dialog does not overflow the viewport', !overflows)
  await shot('07-mobile-dialog')

  check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '))
} finally {
  await browser.close()
  await server.close()
}

console.log(failed ? `\nFAIL: ${failed} assertion(s)` : '\nPASS: all assertions')
console.log(`screenshots -> ${SHOTS}`)
process.exit(failed ? 1 : 0)
