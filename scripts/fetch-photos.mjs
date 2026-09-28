/**
 * Catalogue photography importer.
 *
 *   npm i -D sharp && node scripts/fetch-photos.mjs
 *
 * Fetches the selected CC0 photographs listed in scripts/photo-sources.json and
 * writes them to public/images/photos in the crops the UI needs, recording
 * provenance in scripts/photo-credits.json.
 *
 * The selection is pinned by pool index, so re-running never silently swaps in
 * different photography. Every image is CC0 1.0 (a public domain dedication),
 * so attribution is not legally required; CREDITS.md records it anyway.
 *
 * IMPORTANT: the pool indices below were chosen by reviewing every candidate
 * render. Several indices in the pool are unusable - vintage fashion plates,
 * line art and unrelated street photography - so the list is explicit rather
 * than "take the first N results".
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'images', 'photos')

/**
 * output basename -> [pool index, crop]
 * Crop 'card' is the 4:5 product frame, 'wide' is 16:9, 'band' is 3:2.
 */
/**
 * Indices were assigned by reviewing the labelled contact sheet of the whole
 * pool, not from titles - the stock sources reuse generic names like
 * "Fashion Clothes", so a title is no guide to the actual subject.
 *
 * Rejected: 0 (retail interior), 7 and 21-24 (lifestyle shoes shot against
 * pavement, chain-link, grass or a green mat - wrong palette, no product read),
 * 12, 13, 14, 15, 16, 17, 18 (vintage fashion plates and line art, not photos
 * of garments), 11 (street, autumn leaves).
 */
const SELECTION = {
  // --- accessories ---
  'structured-leather-tote': [27, 'card'], // black structured tote, studio
  'brown-leather-satchel': [26, 'card'], // worn leather satchel

  // --- tailoring / outerwear ---
  'checked-tailored-suit': [32, 'card'], // checked three-piece on a mannequin
  'quilted-puffer': [9, 'card'], // quilted jacket on a mannequin
  'wool-coat-rail': [29, 'card'], // rail of cream coats
  'rose-wool-detail': [30, 'card'], // rose wool suiting detail

  // --- footwear ---
  'tan-leather-brogues': [4, 'card'], // tan brogues with a polka-dot shirt
  'leather-shoes-knitwear': [5, 'card'], // tan shoes with folded knitwear
  'minimal-white-sneakers': [22, 'card'], // white sneakers, minimal product shot

  // --- tops ---
  'long-sleeve-jersey': [6, 'card'], // dark long-sleeve top on a hanger
  'plaid-oxford-shirt': [1, 'card'], // plaid shirt with derby shoes
  'rose-ribbed-knit': [10, 'card'], // ribbed knit, rose
  'blush-merino-detail': [31, 'card'], // soft blush fabric detail
  'poplin-shirt-rail': [28, 'card'], // shirts on a rail
  'linen-dress-rail': [19, 'card'], // white linen dresses on a rail

  // --- bottoms ---
  'straight-leg-denim': [2, 'card'], // straight jeans with brown boots
  'tapered-jeans-sneakers': [25, 'card'], // tapered jeans, white sneakers

  // --- editorial ---
  'tee-denim-flatlay': [3, 'card'], // white tee, denim and accessories

  // --- large format ---
  'hero-rail': [29, 'wide'],
  'banner-satchel': [26, 'band'],
  'banner-puffer': [9, 'band'],
  'banner-tote': [27, 'band'],
  'collection-tailoring': [32, 'band'],
  'collection-dresses': [19, 'band'],
  'collection-knitwear': [5, 'band'],
  'collection-shoes': [4, 'band'],
  'collection-denim': [2, 'band'],
}

const CROPS = {
  card: { width: 1100, height: 1375 },
  wide: { width: 2000, height: 1125 },
  band: { width: 1350, height: 900 },
}

const sources = JSON.parse(readFileSync(join(ROOT, 'scripts', 'photo-sources.json'), 'utf8'))

mkdirSync(OUT, { recursive: true })

const credits = []
const seen = new Map()

for (const [name, [idx, crop]] of Object.entries(SELECTION)) {
  const src = sources[idx]
  if (!src) throw new Error(`no source at index ${idx} for ${name}`)

  // A source may back several crops; fetch it once.
  let raw = seen.get(src.url)
  if (!raw) {
    const res = await fetch(src.url, { signal: AbortSignal.timeout(45000) })
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status} for ${src.url}`)
    raw = Buffer.from(await res.arrayBuffer())
    seen.set(src.url, raw)
  }

  const img = sharp(raw).rotate()
  const meta = await img.metadata()
  const { width, height } = CROPS[crop]

  const out = await img
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()

  writeFileSync(join(OUT, `${name}.jpg`), out)
  if (!credits.some((c) => c.page === src.page)) {
    credits.push({
      file: 'public/images/photos/',
      title: src.title,
      creator: src.creator,
      license: 'CC0 1.0 Universal',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      page: src.page,
      originalSize: `${meta.width}x${meta.height}`,
    })
  }
}

const total = credits.length && Object.keys(SELECTION).reduce((sum, n) => {
  const buf = readFileSync(join(OUT, `${n}.jpg`))
  return sum + buf.length
}, 0)

console.log(`${Object.keys(SELECTION).length} files from ${seen.size} CC0 sources`)
console.log(`total ${(total / 1024).toFixed(0)} kB`)
writeFileSync(join(ROOT, 'scripts', 'photo-credits.json'), JSON.stringify(credits, null, 2))
console.log(`provenance -> scripts/photo-credits.json (${credits.length} sources)`)
