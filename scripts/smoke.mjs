/**
 * Server-render smoke test.
 *
 * Renders the whole app to a string so a broken import, a bad hook order or a
 * missing data field fails fast in CI without needing a browser:
 *
 *   npm run test:smoke
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const checks = [
  { file: '/src/App.jsx', name: 'App' },
  { file: '/src/components/Header.jsx', name: 'Header' },
  { file: '/src/components/Hero.jsx', name: 'Hero' },
  { file: '/src/components/CartDrawer.jsx', name: 'CartDrawer' },
  { file: '/src/components/SearchOverlay.jsx', name: 'SearchOverlay' },
  { file: '/src/components/AccountModal.jsx', name: 'AccountModal' },
  { file: '/src/components/ChatWidget.jsx', name: 'ChatWidget' },
  { file: '/src/components/Footer.jsx', name: 'Footer' },
  { file: '/src/pages/Home.jsx', name: 'Home' },
]

/** Renders a component with every provider it expects, so hooks resolve. */
async function renderWithProviders(file) {
  const [{ default: Component }, providers] = await Promise.all([
    server.ssrLoadModule(file),
    Promise.all([
      server.ssrLoadModule('/src/context/AuthContext.jsx'),
      server.ssrLoadModule('/src/context/WishlistContext.jsx'),
      server.ssrLoadModule('/src/context/CartContext.jsx'),
      server.ssrLoadModule('/src/context/ShopContext.jsx'),
    ]),
  ])

  const [{ AuthProvider }, { WishlistProvider }, { CartProvider }, { ShopProvider }] = providers
  return renderToString(
    createElement(
      AuthProvider,
      null,
      createElement(
        WishlistProvider,
        null,
        createElement(
          CartProvider,
          null,
          createElement(ShopProvider, null, createElement(Component, { open: false })),
        ),
      ),
    ),
  )
}
let failed = false
let homeHtml = ''

for (const { file, name } of checks) {
  try {
    const html = await renderWithProviders(file)
    if (name === 'Home') homeHtml = html
    console.log(`  ✓ ${name.padEnd(15)} ${String(html.length).padStart(7)} chars`)
  } catch (error) {
    failed = true
    console.error(`  ✗ ${name}: ${error.message}`)
  }
}

/* --- every referenced asset must exist in public/ (PRD §35) --- */
const referenced = new Set()
for (const match of homeHtml.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
  for (const part of match[1].split(',')) {
    const value = part.trim().split(/\s+/)[0]
    if (value.startsWith('/images/') || value === '/favicon.svg') referenced.add(value)
  }
}

const missing = [...referenced].filter(
  (file) => !existsSync(join(ROOT, 'public', file.replace(/^\//, ''))),
)
if (missing.length > 0) {
  failed = true
  console.error(`  ✗ ${missing.length} missing asset(s): ${missing.join(', ')}`)
} else {
  console.log(`  ✓ assets          ${referenced.size} referenced, all present`)
}

/* --- accessibility spot checks (PRD §31) --- */
const withoutAlt = [...homeHtml.matchAll(/<img\b[^>]*>/g)]
  .map(([tag]) => tag)
  .filter((tag) => !/alt=/.test(tag))
if (withoutAlt.length > 0) {
  failed = true
  console.error(`  ✗ ${withoutAlt.length} <img> without an alt attribute`)
} else {
  console.log('  ✓ a11y            every <img> has an alt attribute')
}

const h1Count = (homeHtml.match(/<h1[\s>]/g) || []).length
const headingLevels = [...homeHtml.matchAll(/<h([1-6])[\s>]/g)].map(([, level]) => Number(level))
const skipped = headingLevels.some((level, index) => index > 0 && level - headingLevels[index - 1] > 1)
if (h1Count !== 1 || skipped) {
  failed = true
  console.error(`  ✗ heading structure: ${h1Count} <h1>, skipped level: ${skipped}`)
} else {
  console.log('  ✓ a11y            single <h1>, no skipped heading levels')
}

await server.close()
process.exit(failed ? 1 : 0)
