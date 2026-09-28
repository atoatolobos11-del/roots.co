#!/usr/bin/env node
/**
 * Stamps the production URL into every place that needs it:
 *
 *   index.html          canonical, og:url, absolute og:image / twitter:image
 *   public/robots.txt   Sitemap: directive
 *   public/sitemap.xml  every <loc>, plus <lastmod>
 *   README.md           the "before deploying" note
 *
 * Replacements are matched by *attribute name*, not by the old URL, so the
 * script is idempotent: running it twice with the same URL is a no-op, and
 * running it with a different URL always updates cleanly.
 *
 * Usage:
 *   npm run set:url -- https://your-name.github.io/c-style-portfolio
 *   npm run set:url -- https://c-style.example.com            # root domain
 *   npm run set:url -- http://localhost:5173                  # local testing
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const raw = process.argv[2]

if (!raw) {
  console.error('Usage: npm run set:url -- <absolute-url>\n')
  process.exit(1)
}

let parsed
try {
  parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
} catch {
  console.error(`Not a valid URL: ${raw}`)
  process.exit(1)
}

if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
  console.error(`Unsupported protocol "${parsed.protocol}" - use http or https.`)
  process.exit(1)
}

// Directory-style URL with a guaranteed trailing slash: "/", "/repo/", ...
const siteUrl = parsed.href.endsWith('/') ? parsed.href : `${parsed.href}/`
const origin = parsed.origin
const basePath = parsed.pathname.replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

/** Make a possibly-relative asset reference absolute against the site origin. */
const absolute = (url) => (url.startsWith('/') ? origin + url : url)

const report = []

function apply(file, edits) {
  const path = join(root, file)
  if (!existsSync(path)) return
  const before = readFileSync(path, 'utf8')
  let after = before
  const changed = []

  for (const [label, pattern, to] of edits) {
    const next = after.replace(pattern, to)
    if (next !== after) {
      after = next
      changed.push(label)
    }
  }

  if (after !== before) {
    writeFileSync(path, after)
    report.push({ file, changed })
  }
}

apply('index.html', [
  ['canonical', /(<link rel="canonical" href=")[^"]*(")/, `$1${siteUrl}$2`],
  ['og:url', /(property="og:url" content=")[^"]*(")/, `$1${siteUrl}$2`],
  [
    'og:image',
    /(property="og:image" content=")([^"]*)(")/,
    (_m, a, url, b) => `${a}${absolute(url)}${b}`,
  ],
  [
    'twitter:image',
    /(name="twitter:image" content=")([^"]*)(")/,
    (_m, a, url, b) => `${a}${absolute(url)}${b}`,
  ],
])

apply('public/robots.txt', [
  ['Sitemap', /^Sitemap:.*$/m, `Sitemap: ${siteUrl}sitemap.xml`],
])

apply('public/sitemap.xml', [
  ['loc', /<loc>[^<]*<\/loc>/g, `<loc>${siteUrl}</loc>`],
  ['lastmod', /<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`],
])

apply('README.md', [
  ['deploy note', /https:\/\/c-style\.example\.com\/?/g, siteUrl],
])

// ---- report -----------------------------------------------------------------
console.log(`\nsite url : ${siteUrl}`)
console.log(`origin   : ${origin}`)
console.log(`base path: ${basePath || '/'}`)

if (!report.length) {
  console.log('\nnothing to change - the URL is already applied everywhere.\n')
} else {
  for (const { file, changed } of report) {
    console.log(`updated ${file} (${changed.join(', ')})`)
  }
  console.log('')
}

if (basePath) {
  console.log('This is a sub-path host (e.g. a GitHub Pages project site), so the')
  console.log('build needs a base path. Either:')
  console.log(`  $env:BASE_PATH="${basePath}"; npm run build      # PowerShell`)
  console.log(`  BASE_PATH="${basePath}" npm run build            # bash`)
  console.log('or set BASE_PATH in your Vercel project / CI environment variables.')
} else {
  console.log('Root-domain host - no base path needed, `npm run build` is enough.')
}
console.log('')
