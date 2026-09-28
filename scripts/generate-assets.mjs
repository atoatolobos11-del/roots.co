/**
 * ROOT.CO — original asset generator
 * ------------------------------------------------------------------
 * Every image shipped with this portfolio is generated here as original
 * vector artwork (SVG) so the project contains zero third-party or
 * copyrighted photography. Run with:
 *
 *   npm run generate:assets
 *
 * Art direction: flat tonal "lookbook" illustration on neutral studio
 * backgrounds — minimalist, editorial, on-brand with the ROOT.CO palette.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMG = join(ROOT, 'public', 'images')

/* ------------------------------------------------------------------ */
/* PNG writer (tiny, dependency free) — used for the social card.       */
/* ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function writePng(file, width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, png)
}

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

// Warm tonal palette, matched to the catalogue photography (cream, camel, tan
// leather, denim) so the remaining generated art sits with the photographs.
const CLOTH = [
  ['#2B2622', '#3D3630'],
  ['#A98A62', '#B99C78'],
  ['#DDD5C7', '#E8E1D5'],
  ['#B4553A', '#C3624A'],
  ['#6E7A5C', '#7E8A6B'],
  ['#3E4A5C', '#4C586A'],
  ['#F2ECE2', '#F8F4EC'],
  ['#7A6C5C', '#8A7C6C'],
  ['#B0A793', '#BFB7A4'],
  ['#4A443C', '#5A534A'],
  ['#C9BBA6', '#D5C9B6'],
  ['#8B6A45', '#9C7C57'],
  ['#3B3630', '#4B453D'],
  ['#241F1B', '#322C26'],
]
const BACKDROPS = [
  ['#F4F1EA', '#E4DFD3'],
  ['#EBE6DC', '#D9D2C4'],
  ['#E0DACE', '#CAC1B1'],
  ['#F7F5F0', '#EAE5DA'],
  ['#D5CFC2', '#C0B8A8'],
  ['#D1CBC0', '#B7AF9F'],
  ['#E6E2D8', '#D2CBBB'],
  ['#EFECE4', '#DCD6C8'],
]
/** Backdrop for cards that need to read as a dark, editorial treatment. */
const DARK_BACKDROP = ['#3A322B', '#16120F']

/* ------------------------------------------------------------------ */
/* SVG helpers                                                         */
/* ------------------------------------------------------------------ */

let uid = 0

/** Lighting values for a card, normal or dark. */
const LIGHT = {
  light: { keyInk: '#ffffff', keyTop: 0.5, keyMid: 0.1, vigInk: '#1C1917', vigMax: 0.09 },
  dark: { keyInk: '#ffffff', keyTop: 0.14, keyMid: 0.03, vigInk: '#000000', vigMax: 0.55 },
}

function doc(w, h, inner) {
  uid += 1
  const id = `a${uid}`
  const L = inner.dark ? LIGHT.dark : LIGHT.light
  const defs = `<defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${inner.bg[0]}"/>
      <stop offset="1" stop-color="${inner.bg[1]}"/>
    </linearGradient>
    <!-- Soft light from above. A centred radial highlight read as a visible
         white blob on flat product backgrounds, so the key light is a vertical
         wash and the only radial term is a wide, very soft corner vignette.
         A dark card inverts the lighting so the backdrop recedes. -->
    <linearGradient id="key${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${L.keyInk}" stop-opacity="${L.keyTop}"/>
      <stop offset="0.45" stop-color="${L.keyInk}" stop-opacity="${L.keyMid}"/>
      <stop offset="1" stop-color="${L.keyInk}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vig${id}" cx="0.5" cy="0.42" r="0.78">
      <stop offset="0.55" stop-color="${L.vigInk}" stop-opacity="0"/>
      <stop offset="1" stop-color="${L.vigInk}" stop-opacity="${L.vigMax}"/>
    </radialGradient>
    <linearGradient id="fab${id}" x1="0.12" y1="0" x2="0.88" y2="1">
      <stop offset="0" stop-color="${inner.cloth[1]}"/>
      <stop offset="0.55" stop-color="${inner.cloth[0]}"/>
      <stop offset="1" stop-color="${inner.cloth[0]}"/>
    </linearGradient>
    <!-- Figures live in a 300-wide local space, so they need their own gradient
         keyed to the figure clip id rather than the 800-wide product one. -->
    <linearGradient id="figFIG" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="${inner.cloth[1]}"/>
      <stop offset="0.6" stop-color="${inner.cloth[0]}"/>
      <stop offset="1" stop-color="${inner.cloth[0]}"/>
    </linearGradient>
    <filter id="grain${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    </filter>
  </defs>`

  // Garment silhouettes are emitted with a {{FAB}} placeholder because the
  // gradient id is only known here; substitute it now.
  const body = `<rect width="${w}" height="${h}" fill="url(#bg${id})"/>
  <rect width="${w}" height="${h}" fill="url(#key${id})"/>
  ${inner.art.replaceAll('{{FAB}}', `url(#fab${id})`).replaceAll('{{FIG}}', 'url(#figFIG)')}
  <rect width="${w}" height="${h}" fill="url(#vig${id})"/>
  <rect width="${w}" height="${h}" filter="url(#grain${id})" opacity="0.05"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img">${defs}<g id="art">${body}</g></svg>`
}

function save(rel, w, h, inner) {
  const file = join(IMG, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, doc(w, h, inner))
  return file
}

const shadow = (cx, cy, rx, ry, op = 0.16) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#1C1917" opacity="${op}"/>`

/**
 * The box every garment silhouette occupies in its native 800 x 1000 frame.
 * Hero, collection and banner art re-frames this box rather than the whole
 * 800 x 1000 canvas, so a garment fills a sensible share of the card instead of
 * arriving with 60% empty margin.
 */
const GARMENT_BOX = { x: 210, y: 200, w: 380, h: 720 }

/** Scale a garment's artwork to `targetH` tall, centred on `cx`, standing on `floorY`. */
function garmentInFrame(art, cx, floorY, targetH) {
  const s = targetH / GARMENT_BOX.h
  const tx = cx - (GARMENT_BOX.x + GARMENT_BOX.w / 2) * s
  const ty = floorY - GARMENT_BOX.h * s
  return `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(3)})">${art}</g>`
}

/* ------------------------------------------------------------------ */
/* Garment artwork (800 x 1000)                                        */
/* ------------------------------------------------------------------ */

/**
 * Silhouettes are generated rather than hand-traced. A right-hand outline is
 * sampled from bezier segments and then mirrored across the centre line, so the
 * shape is always smooth and left/right symmetric. Hand written path data for
 * the tops drifted out of proportion and rendered as narrow unreadable strips.
 */
const CX = 400

/** Sample a cubic bezier into points. */
function bez(from, c1, c2, to, steps = 14) {
  const out = []
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    out.push([
      u * u * u * from[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * to[0],
      u * u * u * from[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * to[1],
    ])
  }
  return out
}

/** Close a point ring with quadratics through each point (smooth polygon). */
function smoothClosed(pts) {
  const f = (v) => v.toFixed(1)
  const n = pts.length
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i += 1) {
    const cur = pts[i]
    const nxt = pts[(i + 1) % n]
    d += `Q${f(cur[0])} ${f(cur[1])} ${f((cur[0] + nxt[0]) / 2)} ${f((cur[1] + nxt[1]) / 2)}`
  }
  return `${d}Z`
}

/** Mirror a right-hand outline (x >= cx) into a closed symmetric silhouette. */
function symmetric(hx, cx = CX) {
  const left = hx
    .slice(1, -1)
    .reverse()
    .map(([x, y]) => [2 * cx - x, y])
  return smoothClosed([...hx, ...left])
}

/**
 * A top: neckline, shoulder, sleeve, underarm, side seam and hem.
 *
 * The outline starts at the centre of the neckline, which is the LOW point of
 * the neck opening; the shoulder tip is the highest. Starting the ring at the
 * centre-top instead (a common slip) put a bump above both shoulders, which read
 * as a "moth" silhouette rather than a garment.
 */
function topOutline({
  neckY = 258,
  neckHalf = 46,
  neckDrop = 36,
  shoulderY = 232,
  shoulderHalf = 132,
  sleeveOut = 178,
  sleeveHemY = 486,
  underarmHalf = 126,
  waistHalf = 118,
  hemHalf = 128,
  hemY = 740,
} = {}) {
  // The sleeve leaves the shoulder and falls away from it; the outline only ever
  // travels downward from the shoulder tip, so it can never spike or puff.
  const cuffX = CX + sleeveOut
  const cuffTopY = shoulderY + Math.max(30, (sleeveHemY - shoulderY) * 0.24)

  const neckBaseY = neckY + neckDrop
  const hx = [[CX, neckBaseY]]
  // out of the neck dip and up to the neck/shoulder junction
  hx.push(
    ...bez(
      [CX, neckBaseY],
      [CX + neckHalf * 0.45, neckBaseY],
      [CX + neckHalf - 8, neckY + 12],
      [CX + neckHalf, neckY],
      8,
    ),
  )
  // out to the shoulder tip, the highest point of the garment
  hx.push(
    ...bez(
      [CX + neckHalf, neckY],
      [CX + neckHalf + 22, shoulderY + 4],
      [CX + shoulderHalf - 30, shoulderY],
      [CX + shoulderHalf, shoulderY],
      8,
    ),
  )
  hx.push(...bez([CX + shoulderHalf, shoulderY], [CX + shoulderHalf + 24, shoulderY + 8], [cuffX - 20, cuffTopY - 8], [cuffX, cuffTopY + 26], 12))
  hx.push(...bez([cuffX, cuffTopY + 26], [cuffX + 2, cuffTopY + 40], [cuffX - 2, sleeveHemY - 26], [cuffX - 12, sleeveHemY], 10))
  hx.push(...bez([cuffX - 12, sleeveHemY], [cuffX - 30, sleeveHemY + 22], [CX + underarmHalf + 24, sleeveHemY + 34], [CX + underarmHalf, sleeveHemY + 48], 10))
  hx.push(...bez([CX + underarmHalf, sleeveHemY + 48], [CX + waistHalf + 12, sleeveHemY + 130], [CX + waistHalf - 8, hemY - 150], [CX + hemHalf, hemY - 12], 14))
  hx.push(...bez([CX + hemHalf, hemY - 12], [CX + hemHalf * 0.6, hemY + 6], [CX + 40, hemY + 8], [CX, hemY + 8], 10))
  return symmetric(hx)
}

/** Trousers: waistband, hip, outer leg, hem, inseam and crotch. */
function trouserOutline({ waistY = 268, waistHalf = 88, hipY = 380, hipHalf = 102, hemY = 862, hemOuter = 88, hemInner = 30 } = {}) {
  const hx = [[CX, waistY]]
  hx.push(...bez([CX, waistY], [CX + waistHalf * 0.55, waistY - 4], [CX + waistHalf - 8, waistY + 4], [CX + waistHalf, waistY + 10], 6))
  hx.push(...bez([CX + waistHalf, waistY + 10], [CX + waistHalf + 12, waistY + 40], [CX + hipHalf, hipY - 30], [CX + hipHalf, hipY], 8))
  hx.push(...bez([CX + hipHalf, hipY], [CX + hipHalf + 4, hipY + 170], [CX + hemOuter + 6, hemY - 190], [CX + hemOuter, hemY - 14], 16))
  hx.push(...bez([CX + hemOuter, hemY - 14], [CX + hemOuter, hemY - 6], [CX + hemOuter - 4, hemY], [CX + hemInner + 10, hemY], 6))
  hx.push(...bez([CX + hemInner + 10, hemY], [CX + hemInner + 2, hemY - 130], [CX + hemInner - 4, hemY - 300], [CX + 14, waistY + 200], 14))
  hx.push([CX, waistY + 214])
  return symmetric(hx)
}

/** A skirt: waistband, hip, flare and hem. */
function skirtOutline({ waistY = 268, waistHalf = 76, hipY = 400, hemY = 856, hemHalf = 176 } = {}) {
  const hx = [[CX, waistY]]
  hx.push(...bez([CX, waistY], [CX + waistHalf * 0.55, waistY - 4], [CX + waistHalf - 8, waistY + 4], [CX + waistHalf, waistY + 12], 6))
  hx.push(...bez([CX + waistHalf, waistY + 12], [CX + waistHalf + 14, waistY + 46], [CX + hemHalf * 0.5, hipY - 20], [CX + hemHalf * 0.52, hipY], 10))
  hx.push(...bez([CX + hemHalf * 0.52, hipY], [CX + hemHalf * 0.66, hipY + 200], [CX + hemHalf - 24, hemY - 170], [CX + hemHalf, hemY - 10], 18))
  hx.push(...bez([CX + hemHalf, hemY - 10], [CX + hemHalf * 0.6, hemY + 6], [CX + 40, hemY + 8], [CX, hemY + 8], 10))
  return symmetric(hx)
}

/** A dress: bodice, cap sleeve, waist and A-line skirt in one outline. */
function dressOutline({ neckY = 268, neckHalf = 40, neckDrop = 30, shoulderY = 244, shoulderHalf = 112, armY = 340, armHalf = 150, underarmHalf = 104, waistY = 440, waistHalf = 96, hemY = 858, hemHalf = 172 } = {}) {
  const neckBaseY = neckY + neckDrop
  const hx = [[CX, neckBaseY]]
  hx.push(...bez([CX, neckBaseY], [CX + neckHalf * 0.45, neckBaseY], [CX + neckHalf - 8, neckY + 10], [CX + neckHalf, neckY], 8))
  hx.push(...bez([CX + neckHalf, neckY], [CX + neckHalf + 20, shoulderY + 4], [CX + shoulderHalf - 28, shoulderY], [CX + shoulderHalf, shoulderY], 8))
  // cap sleeve: out and down to the sleeve edge, then a hard tuck into the
  // underarm so the bodice reads as a body rather than a cape.
  hx.push(...bez([CX + shoulderHalf, shoulderY], [CX + shoulderHalf + 26, shoulderY + 16], [CX + armHalf, armY - 34], [CX + armHalf, armY], 10))
  hx.push(...bez([CX + armHalf, armY], [CX + armHalf - 6, armY + 26], [CX + underarmHalf + 22, armY + 56], [CX + underarmHalf, armY + 74], 10))
  hx.push(...bez([CX + underarmHalf, armY + 74], [CX + waistHalf + 6, waistY - 40], [CX + waistHalf - 2, waistY - 16], [CX + waistHalf, waistY], 8))
  hx.push(...bez([CX + waistHalf, waistY], [CX + waistHalf + 48, waistY + 190], [CX + hemHalf - 30, hemY - 160], [CX + hemHalf, hemY - 10], 18))
  hx.push(...bez([CX + hemHalf, hemY - 10], [CX + hemHalf * 0.6, hemY + 6], [CX + 40, hemY + 8], [CX, hemY + 8], 10))
  return symmetric(hx)
}

let clipSeq = 0

/** Garment = contact shadow, filled silhouette, then detail clipped to it. */
function garment(d, c, footY, detail) {
  clipSeq += 1
  const id = `cl${clipSeq}`
  // The silhouette is filled with the fabric gradient rather than a flat tone.
  // {{FAB}} is substituted by doc(), which owns the per-document gradient id.
  return `${shadow(400, footY + 16, 148, 18)}
  <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
  <path fill="{{FAB}}" d="${d}"/>
  <g clip-path="url(#${id})">${detail}</g>`
}

/** Cuff band across a trouser hem. */
const hemRib = (c, y, outer, inner) =>
  `<path fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.3" d="M${CX - outer} ${y - 14}h${outer - inner}h${outer - inner}"/>`

/** Footwear in profile: upper, contrasting sole, collar opening and laces. */
function shoe(c, kind) {
  return `
    ${shadow(420, 712, 224, 20)}
    <path fill="${c[0]}" d="M206 592c0-56 26-98 72-120 30-14 62-18 96-14 24 3 44 12 60 28l30 32c24 26 58 44 100 54 40 10 66 28 72 52 4 18-8 34-32 42-32 11-76 16-134 16H242c-22 0-36-12-36-30z"/>
    <path fill="${c[1]}" d="M190 640c0-8 6-14 16-14h412c14 0 22 8 20 18-4 18-26 30-62 30H232c-26 0-42-12-42-34z"/>
    <path fill="${c[0]}" d="M300 500c24-14 52-20 82-18l-14 66c-26-4-52-16-74-32z"/>
    <ellipse cx="354" cy="508" rx="36" ry="13" fill="${c[1]}" opacity="0.5"/>
    ${
      kind === 'sneaker'
        ? `<g fill="none" stroke="${c[1]}" stroke-width="7" stroke-linecap="round" opacity="0.9">
             <path d="M352 492l36 28M388 490l36 28M424 494l34 26"/>
           </g>`
        : `<path fill="none" stroke="${c[1]}" stroke-width="9" stroke-linecap="round" opacity="0.9" d="M334 550h92"/>`
    }
    <path fill="${c[0]}" d="M596 564c30 6 52 16 66 30 10 10 12 20 6 30-8 12-28 18-60 18-14 0-22-6-22-18 0-22 4-42 10-60z"/>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.4" d="M258 678h296"/>`
}

const GARMENTS = {
  // Ribbed knit: a relaxed boxy body, set-in sleeves, scoop neck, ribbed hem.
  knit: (c) =>
    garment(
      topOutline({ neckHalf: 50, neckDrop: 34, shoulderHalf: 140, sleeveOut: 186, sleeveHemY: 500, hemHalf: 142, hemY: 748 }),
      c,
      756,
      `<path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5" d="M330 292c44 20 96 20 140 0"/>
      <g stroke="${c[1]}" stroke-width="3" opacity="0.45" fill="none">
        ${Array.from({ length: 7 }, (_, i) => `<path d="M300 ${512 + i * 26}h200"/>`).join('')}
      </g>
      <path fill="none" stroke="${c[1]}" stroke-width="4" opacity="0.4" d="M288 744h224"/>`,
    ),

  tee: (c) =>
    garment(
      topOutline({ neckY: 244, neckHalf: 44, neckDrop: 26, shoulderY: 252, shoulderHalf: 134, sleeveOut: 178, sleeveHemY: 420, hemHalf: 134, hemY: 726 }),
      c,
      734,
      `<path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.4" d="M330 282c44 20 96 20 140 0"/>`,
    ),

  shirt: (c) =>
    garment(
      topOutline({ neckY: 246, neckHalf: 42, neckDrop: 30, shoulderY: 254, shoulderHalf: 138, sleeveOut: 182, sleeveHemY: 540, waistHalf: 120, hemHalf: 130, hemY: 812 }),
      c,
      820,
      `<path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5" d="M400 270v556"/>
      <g fill="${c[1]}" opacity="0.75">
        ${Array.from({ length: 5 }, (_, i) => `<circle cx="400" cy="${356 + i * 90}" r="4.5"/>`).join('')}
      </g>
      <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.32" d="M304 470h42M454 470h42M304 640h42M454 640h42"/>`,
    ),

  cardigan: (c) =>
    garment(
      topOutline({ neckY: 244, neckHalf: 46, neckDrop: 32, shoulderY: 252, shoulderHalf: 140, sleeveOut: 188, sleeveHemY: 560, waistHalf: 122, hemHalf: 134, hemY: 820 }),
      c,
      828,
      `<path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5" d="M400 268v556"/>
      <g stroke="${c[1]}" stroke-width="2.5" opacity="0.3" fill="none">
        ${Array.from({ length: 8 }, (_, i) => `<path d="M300 ${470 + i * 28}h200"/>`).join('')}
      </g>
      <g fill="${c[1]}" opacity="0.7">
        ${Array.from({ length: 4 }, (_, i) => `<circle cx="400" cy="${400 + i * 104}" r="4.5"/>`).join('')}
      </g>`,
    ),

  sweatshirt: (c) =>
    garment(
      topOutline({ neckY: 248, neckHalf: 48, neckDrop: 26, shoulderY: 258, shoulderHalf: 148, sleeveOut: 198, sleeveHemY: 520, underarmHalf: 140, waistHalf: 140, hemHalf: 152, hemY: 762 }),
      c,
      770,
      `<path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.4" d="M330 298c44 18 96 18 140 0"/>
      <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.4">
        <path d="M288 700h224M284 734h232M292 666h216"/>
      </g>`,
    ),

  coat: (c) =>
    garment(
      topOutline({ neckY: 246, neckHalf: 44, neckDrop: 30, shoulderY: 254, shoulderHalf: 144, sleeveOut: 194, sleeveHemY: 600, waistHalf: 124, hemHalf: 142, hemY: 888 }),
      c,
      896,
      `<path fill="none" stroke="${c[1]}" stroke-width="4" opacity="0.5" d="M400 264v624"/>
      <rect x="292" y="524" width="216" height="24" fill="${c[1]}" opacity="0.6"/>
      <g fill="${c[1]}" opacity="0.8"><circle cx="400" cy="536" r="8"/></g>
      <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.32" d="M320 706h50M430 706h50"/>`,
    ),

  dress: (c) =>
    garment(dressOutline({}), c, 866, `<g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.28">
        ${Array.from({ length: 4 }, (_, i) => `<path d="M${292 + i * 8} 620c40 ${20 * i} ${150 - i * 6} ${20 * i} ${192 - i * 14} 0"/>`).join('')}
      </g>
      <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.4" d="M400 232v92"/>`),

  trouser: (c) =>
    garment(trouserOutline({}), c, 878, `${hemRib(c, 862, 88, 30)}
      <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.4" d="M400 340v506"/>
      <path fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.3" d="M340 300h120M298 306v18M502 306v18"/>
      <path fill="none" stroke="${c[1]}" stroke-width="2" opacity="0.22" d="M330 430h40M430 430h40"/>`),

  wideTrouser: (c) =>
    garment(trouserOutline({ waistHalf: 92, hipHalf: 112, hemY: 868, hemOuter: 112, hemInner: 44 }), c, 884, `${hemRib(c, 868, 112, 44)}
      <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.4" d="M400 340v512"/>
      <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.26">
        <path d="M300 620h84M416 620h84M288 700h96M416 700h96"/>
      </g>`),

  denim: (c) =>
    garment(trouserOutline({ waistHalf: 86, hipHalf: 98, hemY: 866, hemOuter: 84, hemInner: 28 }), c, 882, `${hemRib(c, 866, 84, 28)}
      <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.38">
        <path d="M400 336v512M344 298h112"/>
        <path d="M304 470h60M436 470h60M308 566h56M436 566h56"/>
      </g>
      <circle cx="400" cy="322" r="4.5" fill="${c[1]}" opacity="0.6"/>`),

  chino: (c) =>
    garment(trouserOutline({ waistHalf: 86, hipHalf: 98, hemY: 864, hemOuter: 86, hemInner: 30 }), c, 880, `${hemRib(c, 864, 86, 30)}
      <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.4" d="M400 336v510M352 298h96"/>
      <path fill="none" stroke="${c[1]}" stroke-width="2" opacity="0.25" d="M336 430h38M426 430h38"/>`),

  skirt: (c) =>
    garment(skirtOutline({}), c, 872, `<g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.28">
        ${Array.from({ length: 5 }, (_, i) => `<path d="M${320 + i * 5} 400l-24 440M${362 + i * 6} 400l-9 442M${438 - i * 6} 400l9 442M${480 - i * 5} 400l24 440"/>`).join('')}
      </g>
      <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.32" d="M300 278h200"/>`),

  sneaker: (c) => shoe(c, 'sneaker'),
  loafer: (c) => shoe(c, 'loafer'),

  shoulderBag: (c) => `
    ${shadow(400, 786, 150, 18)}
    <path fill="none" stroke="${c[0]}" stroke-width="15" stroke-linecap="round" d="M302 418c0-70 44-114 98-114s98 44 98 114"/>
    <path fill="${c[0]}" d="M240 404h320c16 0 28 12 28 28v292c0 32-26 58-58 58H270c-32 0-58-26-58-58V432c0-16 12-28 28-28z"/>
    <path fill="${c[1]}" opacity="0.38" d="M240 404h320c16 0 28 12 28 28v52H212v-52c0-16 12-28 28-28z"/>
    <path fill="${c[1]}" d="M212 476h376v30H212z"/>
    <path fill="none" stroke="${c[0]}" stroke-width="3" opacity="0.28" d="M212 506h376"/>
    <rect x="352" y="546" width="96" height="64" rx="10" fill="${c[1]}" opacity="0.85"/>
    <path fill="none" stroke="${c[0]}" stroke-width="3" opacity="0.25" d="M262 660h276"/>
    <g fill="${c[1]}" opacity="0.65"><circle cx="230" cy="491" r="5"/><circle cx="570" cy="491" r="5"/></g>`,

  crossbody: (c) => `
    ${shadow(400, 768, 130, 16)}
    <path fill="none" stroke="${c[0]}" stroke-width="13" stroke-linecap="round" d="M240 336c62-42 204-54 312-24"/>
    <path fill="${c[0]}" d="M272 428h256c13 0 23 10 23 23v214c0 27-21 48-48 48H297c-27 0-48-21-48-48V451c0-13 10-23 23-23z"/>
    <path fill="${c[1]}" opacity="0.38" d="M272 428h256c13 0 23 10 23 23v50H249v-50c0-13 10-23 23-23z"/>
    <path fill="${c[1]}" d="M249 494h302v26H249z"/>
    <path fill="none" stroke="${c[0]}" stroke-width="3" opacity="0.28" d="M249 520h302"/>
    <rect x="370" y="550" width="62" height="42" rx="8" fill="${c[1]}" opacity="0.85"/>
    <g fill="${c[1]}" opacity="0.65"><circle cx="264" cy="507" r="4.5"/><circle cx="536" cy="507" r="4.5"/></g>`,

  // A looped scarf: a wrapped band with two tails falling from it.
  scarf: (c) => `
    ${shadow(400, 890, 114, 16)}
    <path fill="${c[0]}" d="M262 196c0-14 10-24 24-24h248c14 0 24 10 24 24 0 16-14 28-32 28H294c-18 0-32-12-32-28z"/>
    <path fill="${c[0]}" d="M300 232h84c10 0 18 8 18 18v306c0 14 8 24 22 24 12 0 20-8 20-20V258c0-16 10-26 26-26h54c14 0 24 10 24 24v304c0 20-12 34-32 34-16 0-28-10-28-28V268h-44v272c0 26-16 42-42 42-26 0-44-18-44-48V268h-40c-18 0-28-14-28-36z"/>
    <path fill="${c[1]}" opacity="0.3" d="M262 196c0-14 10-24 24-24h40c-8 8-12 18-12 30 0 8 2 14 6 18h-34c-14 0-24-10-24-24z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.35">
      ${Array.from({ length: 6 }, (_, i) => `<path d="M306 ${520 + i * 32}h86M470 ${540 + i * 32}h86"/>`).join('')}
    </g>`,
}

/* ------------------------------------------------------------------ */
/* Studio set for hero / collection / banner art                       */
/* ------------------------------------------------------------------ */

function studio(w, h, opts = {}) {
  const { floor = 0.72, tone = 0, arch = false, dark = false } = opts
  const bg = dark ? DARK_BACKDROP : BACKDROPS[tone % BACKDROPS.length]
  const floorY = h * floor
  const inset = w * 0.12
  const topY = h * 0.1

  // On a dark card the wall panel is a faint lift rather than a bright sweep.
  const panel = arch
    ? `<path fill="#ffffff" opacity="${dark ? 0.07 : 0.34}" d="M${w / 2 - w * 0.28} ${floorY} V${h * 0.32} a${w * 0.28} ${w * 0.28} 0 0 1 ${w * 0.56} 0 V${floorY} Z"/>
       <path fill="none" stroke="#ffffff" stroke-width="1.5" opacity="${dark ? 0.08 : 0.05}" d="M${w / 2 - w * 0.28} ${floorY} V${h * 0.32} a${w * 0.28} ${w * 0.28} 0 0 1 ${w * 0.56} 0 V${floorY}"/>`
    : `<path fill="#ffffff" opacity="${dark ? 0.05 : 0.26}" d="M${inset} ${floorY} V${topY} H${w - inset} V${floorY} Z"/>`

  const art = `
    <rect x="0" y="${floorY}" width="${w}" height="${h - floorY}" fill="#000000" opacity="${dark ? 0.3 : 0.055}"/>
    <rect x="0" y="${floorY}" width="${w}" height="2" fill="#000000" opacity="${dark ? 0.4 : 0.1}"/>
    ${panel}
    ${opts.art ?? ''}`

  return { bg, art, dark }
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const PRODUCTS = [
  ['ribbed-knit-top', 'knit', 0],
  ['straight-leg-denim', 'denim', 1],
  ['linen-blend-dress', 'dress', 2],
  ['oversized-sweatshirt', 'sweatshirt', 3],
  ['classic-sneakers', 'sneaker', 4],
  ['structured-shoulder-bag', 'shoulderBag', 5],
  ['relaxed-cotton-shirt', 'shirt', 6],
  ['wide-leg-trousers', 'wideTrouser', 7],
  ['minimal-leather-loafers', 'loafer', 8],
  ['everyday-crossbody-bag', 'crossbody', 9],
  ['merino-cardigan', 'cardigan', 10],
  ['pleated-midi-skirt', 'skirt', 11],
  ['garment-dyed-tee', 'tee', 12],
  ['relaxed-chinos', 'chino', 13],
]

const CATEGORIES = [
  ['tops', 'knit', 0],
  ['bottoms', 'trouser', 7],
  ['dresses', 'dress', 2],
  ['shoes', 'loafer', 8],
  ['accessories', 'shoulderBag', 5],
  ['men', 'coat', 6],
]

const COLLECTIONS = [
  ['date-night', 'dress', 3, 0],
  ['weekend-edit', 'tee', 12, 6],
  ['workwear', 'coat', 13, 1],
  ['street-style', 'sneaker', 4, 5],
  ['minimal-essentials', 'shirt', 6, 2],
]

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

// — product shots (two views per product: colourway + alternate colourway)
for (const [slug, art, i] of PRODUCTS) {
  for (const view of [1, 2]) {
    const cloth = CLOTH[(i + (view === 2 ? 5 : 0)) % CLOTH.length]
    const bg = BACKDROPS[(i + (view === 2 ? 3 : 0)) % BACKDROPS.length]
    save(`products/${slug}-${view}.svg`, 800, 1000, { bg, cloth, art: GARMENTS[art](cloth) })
  }
}

// — circular category art: the garments are drawn in an 800×1000 space, so
// they are scaled and centred into the 480×480 tile instead of being cropped.
for (const [slug, art, i] of CATEGORIES) {
  const cloth = CLOTH[(i + 2) % CLOTH.length]
  const bg = BACKDROPS[(i + 1) % BACKDROPS.length]
  save(`categories/${slug}.svg`, 480, 480, {
    bg,
    cloth,
    art: `<g transform="translate(240 246) scale(0.44) translate(-400 -520)">${GARMENTS[art](cloth)}</g>`,
  })
}

// — sale tile (darker treatment)
save('categories/sale.svg', 480, 480, {
  bg: ['#332E2A', '#1C1917'],
  cloth: ['#3A3A38', '#4A4A48'],
  art: `<g fill="none" stroke="#DDD5C7" stroke-width="6" opacity="0.5">
      <path d="M40 40h90v90H40z"/>
    </g>
    <text x="240" y="212" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="112" font-weight="600" letter-spacing="4" fill="#F8F5EF">−50%</text>
    <rect x="150" y="258" width="180" height="2" fill="#DDD5C7" opacity="0.6"/>
    <text x="240" y="308" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" letter-spacing="8" fill="#DDD5C7" opacity="0.85">SALE</text>`,
})

// — collection cards: a garment presented in a studio niche, like a shop
// window. Hero / collection / banner art uses garments rather than figures —
// a hand-built human silhouette read as a mannequin blob at card size, while
// the garment artwork holds up cleanly.
for (const [slug, art, clothIdx, tone] of COLLECTIONS) {
  const cloth = CLOTH[clothIdx % CLOTH.length]
  const w = 900
  const h = 1200
  save(`collections/${slug}.svg`, w, h, {
    ...studio(w, h, {
      floor: 0.84,
      tone,
      arch: true,
      art: garmentInFrame(GARMENTS[art](cloth), w / 2, h * 0.84, h * 0.6),
    }),
    cloth,
  })
}

// — hero (desktop wide + mobile portrait): a pair of styled pieces
{
  const w = 2000
  const h = 1250
  save('hero/hero-desktop.svg', w, h, {
    ...studio(w, h, {
      floor: 0.86,
      tone: 3,
      art:
        garmentInFrame(GARMENTS.coat(CLOTH[0]), w * 0.58, h * 0.86, h * 0.72) +
        garmentInFrame(GARMENTS.denim(CLOTH[6]), w * 0.78, h * 0.86, h * 0.56),
    }),
    cloth: CLOTH[0],
  })

  const mw = 1000
  const mh = 1400
  save('hero/hero-mobile.svg', mw, mh, {
    ...studio(mw, mh, {
      floor: 0.88,
      tone: 3,
      arch: true,
      art: garmentInFrame(GARMENTS.dress(CLOTH[2]), mw / 2, mh * 0.88, mh * 0.56),
    }),
    cloth: CLOTH[2],
  })
}

// — promo banners
{
  const w = 1200
  const h = 900
  // A light garment on a dark backdrop: this card is the one place the set is
  // lit from behind, so the subject needs to stay legible against it.
  save('banners/student.svg', w, h, {
    ...studio(w, h, {
      floor: 0.88,
      arch: true,
      dark: true,
      art: garmentInFrame(GARMENTS.sweatshirt(CLOTH[11]), w * 0.68, h * 0.88, h * 0.66),
    }),
    cloth: CLOTH[11],
  })

  save('banners/new-season.svg', w, h, {
    bg: ['#F8F5EF', '#EDE7DC'],
    cloth: CLOTH[3],
    art: garmentInFrame(GARMENTS.dress(CLOTH[3]), w * 0.66, h * 0.9, h * 0.68),
  })

  // — store card: a shopfront. Built from an awning, a glazed window with a
  // rail of hangers, a fascia sign and a planter, so it reads as a storefront
  // rather than a stack of grey rectangles.
  save('banners/store.svg', 1200, 900, {
    bg: ['#EFEDE8', '#D6D2C9'],
    cloth: CLOTH[5],
    art: `
    <rect x="0" y="742" width="1200" height="158" fill="#1C1917" opacity="0.06"/>
    <rect x="0" y="742" width="1200" height="2" fill="#1C1917" opacity="0.1"/>
    <rect x="96" y="150" width="1008" height="594" fill="#1C1917" opacity="0.07"/>
    <rect x="112" y="166" width="976" height="578" fill="#F8F5EF" opacity="0.8"/>
    <rect x="112" y="166" width="976" height="96" fill="#1C1917" opacity="0.9"/>
    <text x="600" y="228" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="600" letter-spacing="14" fill="#F8F5EF">ROOT.CO</text>
    <path fill="#1C1917" opacity="0.12" d="M112 262h976l40 96H72z"/>
    ${Array.from({ length: 11 }, (_, i) => `<rect x="${80 + i * 96}" y="358" width="48" height="96" fill="#F8F5EF" opacity="${i % 2 ? 0.85 : 0.6}"/>`).join('')}
    <path fill="#1C1917" opacity="0.14" d="M72 454h1056l-10 26H82z"/>
    <rect x="150" y="486" width="560" height="258" fill="#A98A62" opacity="0.28"/>
    <path fill="#ffffff" opacity="0.2" d="M150 486h360l-360 258z"/>
    <rect x="150" y="486" width="560" height="258" fill="none" stroke="#1C1917" stroke-width="6" opacity="0.16"/>
    <rect x="186" y="556" width="488" height="4" fill="#1C1917" opacity="0.28"/>
    ${[0, 1, 2, 3]
      .map(
        (i) => `<g opacity="${0.85 - i * 0.12}">
          <path fill="none" stroke="#1C1917" stroke-width="3" d="M${232 + i * 122} 556v22"/>
          <path fill="#A98A62" d="M${208 + i * 122} 646l24-52 24 52z"/>
          <path fill="none" stroke="#1C1917" stroke-width="2.5" opacity="0.5" d="M${200 + i * 122} 646h64"/>
        </g>`,
      )
      .join('')}
    <rect x="758" y="486" width="292" height="258" fill="#1C1917" opacity="0.1"/>
    <rect x="778" y="506" width="252" height="238" fill="#F8F5EF" opacity="0.5"/>
    <rect x="1006" y="606" width="8" height="34" fill="#1C1917" opacity="0.45"/>
    <rect x="92" y="628" width="112" height="114" rx="8" fill="#1C1917" opacity="0.16"/>
    <path fill="#5F6B5C" d="M148 640c-8-64-4-114 0-136 6 26 8 92 0 136z"/>
    <path fill="#5F6B5C" opacity="0.85" d="M148 596c-44-18-76-50-82-96 38 12 74 44 82 96z"/>
    <path fill="#5F6B5C" opacity="0.7" d="M148 610c42-16 74-46 80-90-36 10-72 40-80 90z"/>`,
  })
}

// — social card (PNG, 1200x630)
{
  const w = 1200
  const h = 630
  const buf = Buffer.alloc(w * h * 4)
  const mix = (a, b, t) => a + (b - a) * t
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const t = y / h
      const gx = (x - w * 0.3) / w
      const gy = (y - h * 0.34) / h
      const light = Math.max(0, 1 - Math.sqrt(gx * gx + gy * gy) * 1.5)
      let r = mix(0x11, 0x2a, t) + light * 26
      let g = mix(0x11, 0x29, t) + light * 24
      let b = mix(0x10, 0x25, t) + light * 20
      // monogram ring + bar
      const cx = w / 2
      const cy = h / 2 - 6
      const dx = x - cx
      const dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      if (Math.abs(d - 96) < 5) {
        r += 150
        g += 148
        b += 138
      }
      if (Math.abs(d - 62) < 3) {
        r += 90
        g += 88
        b += 80
      }
      const i = (y * w + x) * 4
      buf[i] = Math.max(0, Math.min(255, Math.round(r)))
      buf[i + 1] = Math.max(0, Math.min(255, Math.round(g)))
      buf[i + 2] = Math.max(0, Math.min(255, Math.round(b)))
      buf[i + 3] = 255
    }
  }
  // thin frame
  for (let y = 0; y < h; y += 1) {
    for (const x of [40, 41, w - 42, w - 41]) {
      const i = (y * w + x) * 4
      buf[i] = 220
      buf[i + 1] = 220
      buf[i + 2] = 214
    }
  }
  for (let x = 0; x < w; x += 1) {
    for (const y of [40, 41, h - 42, h - 41]) {
      const i = (y * w + x) * 4
      buf[i] = 220
      buf[i + 1] = 220
      buf[i + 2] = 214
    }
  }
  writePng(join(ROOT, 'public', 'og-image.png'), w, h, buf)
}

// — favicon
writeFileSync(
  join(ROOT, 'public', 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="10" fill="#1C1917"/><path fill="none" stroke="#F8F5EF" stroke-width="6" stroke-linecap="square" d="M44 22a18 18 0 1 0 0 20"/></svg>`,
)

console.log('✓ original assets written to public/images')
