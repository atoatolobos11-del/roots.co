/**
 * Static audit for dead interactive elements.
 *
 *   node scripts/audit-links.mjs
 *
 * Catches the three ways a button or link silently does nothing:
 *   1. a <button> with no onClick and no type="submit"
 *   2. an <a href="#"> or an anchor with no href and no onClick
 *   3. a hash href pointing at an id that does not exist anywhere
 *
 * Run in CI so a new dead control cannot be committed.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Collect every .jsx/.js under a directory. */
function collect(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) collect(path, out)
    else if (/\.(jsx?|mjs)$/.test(path)) out.push(path)
  }
  return out
}

const srcFiles = collect(join(ROOT, 'src')).map((p) => p.slice(ROOT.length + 1).replace(/\\/g, '/'))
const sources = new Map(
  srcFiles.map((f) => [f, readFileSync(join(ROOT, f), 'utf8')]),
)

/** All opening tags of one kind, with their line numbers. */
function openingTags(source, tag) {
  const out = []
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'g')
  let match
  while ((match = re.exec(source))) {
    out.push({ tag: match[0], line: source.slice(0, match.index).split('\n').length })
  }
  return out
}

const problems = []

for (const [file, source] of sources) {
  for (const { tag, line } of openingTags(source, 'button')) {
    const isSubmit = /type="submit"/.test(tag)
    if (!isSubmit && !/onClick=/.test(tag)) {
      problems.push({ file, line, what: '<button>', why: 'no onClick and not a submit button' })
    }
  }

  for (const { tag, line } of openingTags(source, 'a')) {
    // href may be a string literal, a template literal, or an expression.
    const href =
      tag.match(/\shref="([^"]*)"/)?.[1] ?? tag.match(/\shref=\{`([^`]*)`\}/)?.[1]
    const hasHref = /\shref=/.test(tag)
    const hasClick = /onClick=/.test(tag)
    if (href === '#' || href === '') {
      problems.push({ file, line, what: '<a>', why: `href="${href}" is a dead link` })
    } else if (!hasHref && !hasClick) {
      problems.push({ file, line, what: '<a>', why: 'no href and no onClick' })
    }
  }
}

// Every hash href must resolve to an id that is actually rendered.
const all = [...sources.values()].join('\n')
const ids = new Set([...all.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))

for (const [file, source] of sources) {
  const targets = [
    ...[...source.matchAll(/\shref="#([^"]+)"/g)].map((m) => m[1]),
    // Data modules reference anchors as `href: '#foo'` strings.
    ...[...source.matchAll(/href:\s*'#([^']+)'/g)].map((m) => m[1]),
  ]
  for (const target of new Set(targets)) {
    if (target.includes('{')) continue
    if (!ids.has(target)) {
      problems.push({ file, line: 0, what: `#${target}`, why: 'no element with that id exists' })
    }
  }
}

// Collection cards must map onto a real filter, or "Explore" lands on an
// unfiltered grid.
const categoriesSrc = sources.get('src/data/categories.js') ?? ''
const filterIds = new Set(
  [...categoriesSrc.matchAll(/\{ id: '([^']+)'/g)].map((m) => m[1]),
)
const collectionsSrc = sources.get('src/data/collections.js') ?? ''
for (const m of collectionsSrc.matchAll(/filter: '([^']+)'/g)) {
  if (!filterIds.has(m[1])) {
    problems.push({
      file: 'src/data/collections.js',
      line: 0,
      what: `filter: '${m[1]}'`,
      why: 'no matching id in src/data/categories.js',
    })
  }
}

if (problems.length) {
  console.error(`\nFound ${problems.length} dead or unwired control(s):\n`)
  for (const p of problems) {
    console.error(`  x ${p.file}${p.line ? `:${p.line}` : ''}  ${p.what} — ${p.why}`)
  }
  console.error('\nEvery button needs an onClick (or type="submit"), and every hash')
  console.error('href must point at an id that exists.\n')
  process.exit(1)
}

console.log(`link audit passed — ${srcFiles.length} files, no dead controls`)
