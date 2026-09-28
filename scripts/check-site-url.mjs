#!/usr/bin/env node
/**
 * Fails the build if the production URL has not been stamped yet, or if the
 * URL is inconsistent between index.html, robots.txt and sitemap.xml.
 *
 * Run by CI so a placeholder domain can never be deployed by accident.
 * Run locally with:  npm run check:url
 *                   npm run check:url -- --strict   (exit 1 instead of warn)
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => (existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : '')

const html = read('index.html')
const robots = read('public/robots.txt')
const sitemap = read('public/sitemap.xml')

/** Pull the content of a meta tag / link by attribute name. */
function attr(source, pattern) {
  return source.match(pattern)?.[1]
}

const checks = [
  {
    label: 'index.html has a canonical link',
    value: attr(html, /<link rel="canonical" href="([^"]*)"/),
  },
  { label: 'index.html og:url', value: attr(html, /property="og:url" content="([^"]*)"/) },
  { label: 'index.html og:image', value: attr(html, /property="og:image" content="([^"]*)"/) },
  {
    label: 'index.html twitter:image',
    value: attr(html, /name="twitter:image" content="([^"]*)"/),
  },
  { label: 'robots.txt Sitemap directive', value: attr(robots, /^Sitemap:\s*(\S+)/m) },
  { label: 'sitemap.xml first <loc>', value: attr(sitemap, /<loc>([^<]*)<\/loc>/) },
]

const errors = []

for (const { label, value } of checks) {
  if (!value) {
    errors.push(`${label}: not found`)
    continue
  }
  if (!/^https?:\/\//.test(value)) {
    errors.push(`${label}: not an absolute URL -> ${value}`)
    continue
  }
  if (/\.example\.(com|org|net)\b/.test(value)) {
    errors.push(`${label}: still the placeholder domain -> ${value}`)
  }
}

// canonical, og:url and sitemap must describe the same page.
const canonical = checks[0].value?.replace(/\/$/, '')
const ogUrl = checks[1].value?.replace(/\/$/, '')
const sitemapLoc = checks[5].value?.replace(/\/$/, '')
if (canonical && ogUrl && canonical !== ogUrl) {
  errors.push(`canonical (${canonical}) and og:url (${ogUrl}) disagree`)
}
if (canonical && sitemapLoc && canonical !== sitemapLoc) {
  errors.push(`canonical (${canonical}) and sitemap.xml (${sitemapLoc}) disagree`)
}

// og:image must be absolute, otherwise social scrapers drop it.
const ogImage = checks[2].value
if (ogImage && !/^https?:\/\//.test(ogImage)) {
  errors.push(`og:image is relative (${ogImage}) - run: npm run set:url -- <your-url>`)
}

const strict = process.argv.includes('--strict')

if (errors.length) {
  console.error('\nSite URL check found problems:\n')
  for (const e of errors) console.error(`  x ${e}`)
  console.error('\nStamp the production URL with:\n')
  console.error('  npm run set:url -- https://your-domain.tld\n')

  if (strict) {
    console.error('Failing because --strict was passed (CI does this).\n')
    process.exit(1)
  }
  console.warn('Warning only. Add --strict to make this fail.\n')
} else {
  console.log(`site url check passed (${checks[0].value})`)
}
