/**
 * C-STYLE — original asset generator
 * ------------------------------------------------------------------
 * Every image shipped with this portfolio is generated here as original
 * vector artwork (SVG) so the project contains zero third-party or
 * copyrighted photography. Run with:
 *
 *   npm run generate:assets
 *
 * Art direction: flat tonal "lookbook" illustration on neutral studio
 * backgrounds — minimalist, editorial, on-brand with the C-STYLE palette.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

const SKIN = ['#E8CBB2', '#D8B294', '#B98D6C', '#8E6547']
const HAIR = ['#241E1B', '#3A2C24', '#151312', '#4A3A2C']
const CLOTH = [
  ['#2C2C2A', '#3E3E3B'],
  ['#8C8C7A', '#9C9C89'],
  ['#D8D3C7', '#E3DED3'],
  ['#B4553A', '#C3624A'],
  ['#5F6B5C', '#6E7A6B'],
  ['#2F3A42', '#3A4750'],
  ['#EFE9E1', '#F6F2EC'],
  ['#6E6259', '#7C6F65'],
  ['#A9A396', '#B5AF9F'],
  ['#4A4A48', '#585855'],
  ['#C9C2B4', '#D5CEBF'],
  ['#7A5C48', '#8B6A53'],
  ['#3B3B39', '#4B4B48'],
  ['#1E1E1D', '#2A2A28'],
]
const BACKDROPS = [
  ['#F2F0EB', '#E2DFD7'],
  ['#E9E6E0', '#D7D3CA'],
  ['#DEDAD1', '#C9C5BA'],
  ['#F6F5F2', '#E8E6E1'],
  ['#D3CFC5', '#BEB9AE'],
  ['#CFCBC2', '#B5B0A5'],
  ['#E4E1D9', '#D0CCC2'],
  ['#EDEBE5', '#DAD6CD'],
]

/* ------------------------------------------------------------------ */
/* SVG helpers                                                         */
/* ------------------------------------------------------------------ */

let uid = 0

function doc(w, h, inner) {
  uid += 1
  const id = `a${uid}`
  const defs = `<defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${inner.bg[0]}"/>
      <stop offset="1" stop-color="${inner.bg[1]}"/>
    </linearGradient>
    <radialGradient id="lit${id}" cx="0.5" cy="0.34" r="0.78">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"/>
      <stop offset="0.62" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#111111" stop-opacity="0.14"/>
    </radialGradient>
    <linearGradient id="fab${id}" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="${inner.cloth[1]}"/>
      <stop offset="1" stop-color="${inner.cloth[0]}"/>
    </linearGradient>
    <filter id="grain${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    </filter>
  </defs>`

  const body = `<rect width="${w}" height="${h}" fill="url(#bg${id})"/>
  <rect width="${w}" height="${h}" fill="url(#lit${id})"/>
  ${inner.art}
  <rect width="${w}" height="${h}" filter="url(#grain${id})" opacity="0.055"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img">${defs}<g id="art">${body}</g></svg>`
}

function save(rel, w, h, inner) {
  const file = join(IMG, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, doc(w, h, inner))
  return file
}

const shadow = (cx, cy, rx, ry, op = 0.16) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#111111" opacity="${op}"/>`

/** Local-space contact point of a figure (bottom of the contact shadow). */
const FIG_FOOT = 978

/** Transform that plants a figure's feet on a floor line, centred at `cx`. */
const place = (cx, floorY, scale = 1) =>
  `translate(${(cx - 150 * scale).toFixed(1)} ${(floorY - FIG_FOOT * scale).toFixed(1)}) scale(${scale})`

/* ------------------------------------------------------------------ */
/* Garment artwork (800 x 1000)                                        */
/* ------------------------------------------------------------------ */

const GARMENTS = {
  knit: (c) => `
    ${shadow(400, 748, 168, 26)}
    <path fill="${c[0]}" d="M352 232c0-24 22-40 48-40s48 16 48 40c16 5 52 12 70 24 30 20 46 66 54 114l24 152c8 36-18 54-38 42l-36-24v166c0 18-14 30-32 30H304c-18 0-32-12-32-30V540l-36 24c-20 12-46-6-38-42l24-152c8-48 24-94 54-114 18-12 54-19 70-24Z"/>
    <path fill="${c[1]}" opacity="0.5" d="M352 232c0-24 22-40 48-40 10 0 19 2 27 6-14 8-23 20-23 34 0 18 10 34 26 44-6 2-12 3-18 3-26 0-48-16-48-40z"/>
    <g stroke="${c[1]}" stroke-width="3" opacity="0.55" fill="none">
      ${Array.from({ length: 7 }, (_, i) => `<path d="M300 ${470 + i * 22}h200"/>`).join('')}
    </g>
    <path fill="none" stroke="${c[1]}" stroke-width="4" opacity="0.5" d="M272 660h256"/>`,

  tee: (c) => `
    ${shadow(400, 706, 150, 24)}
    <path fill="${c[0]}" d="M360 250c0-24 18-38 40-38s40 14 40 38l72 20c28 10 40 48 44 84l10 100c4 26-14 40-30 34l-28-12 4 186c0 20-16 32-36 32H324c-20 0-36-12-36-32l4-186-28 12c-16 6-34-8-30-34l10-100c4-36 16-74 44-84z"/>
    <path fill="${c[1]}" opacity="0.45" d="M360 250c0-24 18-38 40-38 8 0 16 2 22 6-10 9-16 20-16 32 0 16 9 30 23 39-5 1-11 1-17 1-22 0-40-14-40-38z"/>
    <g stroke="${c[1]}" stroke-width="2.5" opacity="0.45" fill="none">
      ${Array.from({ length: 4 }, (_, i) => `<path d="M290 ${560 + i * 20}h220"/>`).join('')}
    </g>`,

  shirt: (c) => `
    ${shadow(400, 786, 152, 24)}
    <path fill="${c[0]}" d="M358 244c0-22 18-34 42-34s42 12 42 34l76 22c30 9 42 50 46 88l10 92c4 24-14 38-30 32l-26-12 4 296c0 18-14 28-34 28H312c-20 0-34-10-34-28l4-296-26 12c-16 6-34-8-30-32l10-92c4-38 16-79 46-88z"/>
    <path fill="${c[1]}" opacity="0.5" d="M358 244c0-22 18-34 42-34l-26 62 34 34-18 32z"/>
    <path fill="${c[1]}" opacity="0.5" d="M442 244c0-22-18-34-42-34l26 62-34 34 18 32z"/>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.6" d="M400 306v450"/>
    <g fill="${c[1]}">
      ${Array.from({ length: 6 }, (_, i) => `<circle cx="400" cy="${372 + i * 62}" r="5"/>`).join('')}
    </g>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5" d="M276 470h30M494 470h30M276 640h30M494 640h30"/>`,

  cardigan: (c) => `
    ${shadow(400, 806, 168, 26)}
    <path fill="${c[0]}" d="M354 236c0-24 20-38 46-38s46 14 46 38c18 6 54 14 72 28 30 24 44 72 52 122l24 148c8 34-18 52-38 40l-34-22v250c0 18-14 28-34 28H308c-20 0-34-10-34-28V552l-34 22c-20 12-46-6-38-40l24-148c8-50 22-98 52-122 18-14 54-22 72-28Z"/>
    <path fill="${c[1]}" opacity="0.5" d="M354 236c0-24 20-38 46-38 9 0 17 2 25 6-14 9-24 20-25 32-2 22 14 42 36 50-8 1-16 0-24-2-26 0-46-14-46-38z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.55">
      ${Array.from({ length: 9 }, (_, i) => `<path d="M300 ${500 + i * 26}h200"/>`).join('')}
      ${Array.from({ length: 4 }, (_, i) => `<path d="M262 ${480 + i * 40}h44M494 ${480 + i * 40}h44"/>`).join('')}
    </g>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.6" d="M400 300v506"/>`,

  sweatshirt: (c) => `
    ${shadow(400, 800, 178, 28)}
    <path fill="${c[0]}" d="M352 250c0-26 20-40 48-40s48 14 48 40c20 6 62 16 84 32 32 24 48 74 58 128l28 152c10 38-18 58-42 44l-44-30v224c0 20-16 30-38 30H306c-22 0-38-10-38-30V616l-44 30c-24 14-52-6-42-44l28-152c10-54 26-104 58-128 22-16 64-26 84-32Z"/>
    <path fill="${c[1]}" opacity="0.45" d="M352 250c0-26 20-40 48-40 10 0 19 2 27 6-16 9-25 20-26 34-2 20 12 38 34 46-6 2-12 2-19 2-28 0-48-14-48-40z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.5">
      <path d="M268 604h264M262 640h276M270 590h260"/>
    </g>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.55" d="M400 250v520"/>`,

  trouser: (c) => `
    ${shadow(400, 862, 168, 24)}
    <path fill="${c[0]}" d="M316 262c46-14 122-14 168 0l10 250 24 344h-96l-24-282-22 282h-96l24-344z"/>
    <path fill="${c[1]}" opacity="0.5" d="M316 262c46-14 122-14 168 0l4 60c-46-12-126-12-176 0z"/>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5" d="M400 330v520"/>
    <path fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.4" d="M336 296h128M300 300v22M500 300v22"/>`,

  wideTrouser: (c) => `
    ${shadow(400, 866, 196, 26)}
    <path fill="${c[0]}" d="M312 258c50-14 126-14 176 0l6 244 22 350h-116l-22-292-18 292H222l22-350z"/>
    <path fill="${c[1]}" opacity="0.5" d="M312 258c50-14 126-14 176 0l3 62c-52-12-128-12-182 0z"/>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.45" d="M400 324v520"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.35">
      <path d="M280 620h96M424 620h96M266 700h108M426 700h108"/>
    </g>`,

  denim: (c) => `
    ${shadow(400, 858, 158, 24)}
    <path fill="${c[0]}" d="M320 266c44-12 116-12 160 0l8 244 22 336h-92l-20-276-20 276h-92l22-336z"/>
    <path fill="${c[1]}" opacity="0.5" d="M320 266c44-12 116-12 160 0l3 58c-44-10-122-10-166 0z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.5">
      <path d="M400 336v500M336 290h128"/>
      <path d="M296 470h66M438 470h66M300 560h62M438 560h62"/>
    </g>
    <circle cx="400" cy="322" r="5" fill="${c[1]}"/>`,

  chino: (c) => `
    ${shadow(400, 858, 160, 24)}
    <path fill="${c[0]}" d="M322 258c44-12 112-12 156 0l6 242 18 340h-88l-20-274-20 274h-88l18-340z"/>
    <path fill="${c[1]}" opacity="0.45" d="M322 258c44-12 112-12 156 0l3 58c-42-10-118-10-162 0z"/>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5" d="M400 328v500M348 300h104"/>`,

  skirt: (c) => `
    ${shadow(400, 848, 186, 26)}
    <path fill="${c[0]}" d="M330 262c42-12 98-12 140 0l10 96 68 470c4 24-14 40-38 40H290c-24 0-42-16-38-40l68-470z"/>
    <path fill="${c[1]}" opacity="0.5" d="M330 262c42-12 98-12 140 0l3 56c-44-10-102-10-146 0z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.42">
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${312 + i * 4} 400l-24 430M${360 + i * 5} 400l-10 434M${440 - i * 5} 400l10 434M${488 - i * 4} 400l24 430"/>`).join('')}
    </g>`,

  dress: (c) => `
    ${shadow(400, 856, 190, 28)}
    <path fill="${c[0]}" d="M356 252c0-24 20-38 44-38s44 14 44 38l32 22c22 16 30 46 28 76l-16 148c52 96 82 226 92 362 4 26-14 44-40 44H260c-26 0-44-18-40-44 10-136 40-266 92-362l-16-148c-2-30 6-60 28-76z"/>
    <path fill="${c[1]}" opacity="0.45" d="M356 252c0-24 20-38 44-38 8 0 16 2 23 5-13 9-21 20-22 33-2 22 12 41 33 49-5 1-11 1-17 1-24 0-44-14-44-38z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.4">
      ${Array.from({ length: 5 }, (_, i) => `<path d="M${300 + i * 10} 560c${40} ${20 * i} ${160 - i * 8} ${20 * i} ${200 - i * 20} 0"/>`).join('')}
    </g>
    <path fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5" d="M400 240v116"/>`,

  coat: (c) => `
    ${shadow(400, 890, 190, 28)}
    <path fill="${c[0]}" d="M352 240c0-24 20-40 48-40s48 16 48 40c22 6 62 16 80 34 30 30 44 84 52 142l26 208c8 40-22 60-46 44l-46-34v304c0 18-14 28-34 28H320c-20 0-34-10-34-28V584l-46 34c-24 16-54-4-46-44l26-208c8-58 22-112 52-142 18-18 58-28 80-34Z"/>
    <path fill="${c[1]}" opacity="0.5" d="M352 240c0-24 20-40 48-40 10 0 19 2 28 6-17 9-28 20-29 34-2 22 14 42 38 50-7 2-14 2-22 2-30 0-48-16-48-40z"/>
    <path fill="none" stroke="${c[1]}" stroke-width="3.5" opacity="0.6" d="M400 280v618"/>
    <rect x="300" y="546" width="200" height="26" fill="${c[1]}" opacity="0.7"/>
    <g fill="${c[1]}" opacity="0.9"><circle cx="400" cy="559" r="9"/></g>`,

  sneaker: (c) => `
    ${shadow(410, 704, 250, 24)}
    <path fill="${c[0]}" d="M164 556c0-42 28-70 70-80l84-16c42-8 70 6 92 34l34 44c32 28 84 38 138 44 58 8 92 30 98 66 6 36-18 56-56 58H212c-30 0-48-18-48-46z"/>
    <path fill="${c[1]}" d="M158 622h492c10 26-8 46-42 48H212c-30 0-46-16-54-48z"/>
    <path fill="${c[1]}" opacity="0.5" d="M164 556c0-42 28-70 70-80l30-6c-16 26-14 56 10 74-24 10-40 24-46 44-8 24 4 48 30 58-56-2-94-18-94-90z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="6" stroke-linecap="round" opacity="0.85">
      <path d="M300 486l38 30M330 470l38 30M360 456l38 30"/>
    </g>
    <g fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.5"><path d="M480 566h180M500 600h160"/></g>`,

  loafer: (c) => `
    ${shadow(410, 700, 232, 24)}
    <path fill="${c[0]}" d="M196 520c0-30 18-46 46-52l86-20c34-8 58 4 76 26l40 46c34 26 82 34 132 38 50 4 76 22 78 50 2 34-28 52-76 52H232c-24 0-36-14-36-40z"/>
    <path fill="${c[1]}" d="M198 620h452c-4 24-30 40-72 40H232c-24 0-34-16-34-40z"/>
    <path fill="${c[1]}" opacity="0.55" d="M330 500c30-8 52 2 70 24l26 34-72 12c-30-6-44-22-40-42 3-13 8-22 16-28z"/>
    <path fill="none" stroke="${c[1]}" stroke-width="7" opacity="0.9" d="M330 546h104"/>
    <g fill="none" stroke="${c[1]}" stroke-width="3" opacity="0.45"><path d="M430 596h190M250 596h100"/></g>`,

  shoulderBag: (c) => `
    ${shadow(400, 742, 170, 24)}
    <path fill="none" stroke="${c[0]}" stroke-width="16" d="M300 400c0-70 44-112 100-112s100 42 100 112"/>
    <path fill="${c[0]}" d="M240 392h320c14 0 24 10 24 24v268c0 30-22 52-52 52H268c-30 0-52-22-52-52V416c0-14 10-24 24-24z"/>
    <path fill="${c[1]}" opacity="0.5" d="M240 392h320c14 0 24 10 24 24v58H216v-58c0-14 10-24 24-24z"/>
    <path fill="${c[1]}" d="M216 470h368v26H216z"/>
    <rect x="352" y="500" width="96" height="66" rx="10" fill="${c[1]}" opacity="0.85"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.45"><path d="M266 620h268"/></g>`,

  crossbody: (c) => `
    ${shadow(400, 720, 150, 22)}
    <path fill="none" stroke="${c[0]}" stroke-width="14" d="M252 340h296" transform="rotate(-18 400 340)"/>
    <path fill="${c[0]}" d="M262 420h276c12 0 22 10 22 22v220c0 26-20 46-46 46H286c-26 0-46-20-46-46V442c0-12 10-22 22-22z"/>
    <path fill="${c[1]}" opacity="0.5" d="M262 420h276c12 0 22 10 22 22v54H240v-54c0-12 10-22 22-22z"/>
    <path fill="${c[1]}" d="M240 492h320v24H240z"/>
    <rect x="366" y="520" width="68" height="46" rx="8" fill="${c[1]}" opacity="0.85"/>`,

  scarf: (c) => `
    ${shadow(400, 846, 130, 20)}
    <path fill="${c[0]}" d="M262 180c46 90 34 190-6 268-38 76-52 150-40 232 4 28-18 44-42 32-72-36-96-120-76-212 20-94 30-190 6-268-6-22 14-40 34-28 18 10 26 6 38-10 16-22 62-34 86-14z"/>
    <path fill="${c[1]}" opacity="0.45" d="M262 180c46 90 34 190-6 268l-34-16c-30-70-40-166 2-252z"/>
    <g fill="none" stroke="${c[1]}" stroke-width="2.5" opacity="0.45">
      ${Array.from({ length: 8 }, (_, i) => `<path d="M196 ${700 + i * 18}h120"/>`).join('')}
    </g>`,
}

/* ------------------------------------------------------------------ */
/* Figures for hero / collections / banners (300 x 1000 local space)   */
/* ------------------------------------------------------------------ */

function figure({ cloth, skin, hair, longHair = false, pose = 'coat' }) {
  const c0 = cloth[0]
  const c1 = cloth[1]
  const head = `<ellipse cx="150" cy="72" rx="30" ry="37" fill="${skin}"/>
    ${
      longHair
        ? `<path fill="${hair}" d="M114 74c-4-52 68-58 72-4 2 34-2 62-8 92-4 22-14 40-22 52-6-16-10-34-12-54-14 8-26 6-32-2-4-8-4-42 2-84z"/>`
        : `<path fill="${hair}" d="M118 68c-2-44 66-48 64 0-2-16-14-26-32-26s-30 10-32 26z"/>`
    }`
  const neck = `<path d="M138 100h24l-2 30h-20z" fill="${skin}"/>`
  const legs =
    pose === 'wide'
      ? `<path fill="${cloth[1] ?? c1}" d="M104 640h92l-4 250c-2 34-16 54-40 54-22 0-34-16-34-46z"/>
         <path fill="${cloth[0]}" d="M152 640h92l14 250c4 34-10 54-40 54-24 0-38-16-38-46z"/>`
      : pose === 'dress'
        ? `<path fill="${skin}" d="M126 720h48l-6 200c-2 32-12 50-20 50s-18-18-20-50z"/>
           <path fill="${skin}" d="M174 720h48l6 200c2 32-4 50-12 50s-16-18-18-50z"/>`
        : `<path fill="${cloth[0]}" d="M112 660h76l-4 200c-2 32-14 52-34 52-20 0-30-18-30-50z"/>`
  const shoes = `<path fill="#222222" d="M112 906c22 6 52 6 72 0l2 22c2 16-12 26-36 26-26 0-40-10-38-26z"/>
    <path fill="#222222" d="M186 906c22 6 52 6 72 0l-2 22c-2 16 12 26 36 26 26 0 40-10 38-26z"/>`

  let body
  if (pose === 'dress') {
    body = `<path fill="${c0}" d="M150 128c-30 0-56 14-66 40-14 38-18 130-14 236 2 54 6 100 8 126h144c2-26 6-72 8-126 4-106 0-198-14-236-10-26-36-40-66-40z"/>
      <path fill="${c1}" opacity="0.5" d="M150 128c-12 0-24 3-34 9 18 14 26 34 26 60 0 34-14 60-34 78 18 8 30 20 34 30 4-8 8-16 8-30 0-40 0-80 0-147z"/>`
  } else if (pose === 'wide') {
    body = `<path fill="${c0}" d="M150 126c-34 0-62 16-74 46-16 40-20 138-16 250 2 44 4 76 6 94h168c2-18 4-50 6-94 4-112 0-210-16-250-12-30-40-46-74-46z"/>
      <path fill="${c1}" opacity="0.5" d="M150 126c-12 0-24 3-34 8 20 16 28 40 28 68s-14 52-32 70c16 8 30 16 38 22V126z"/>`
  } else {
    body = `<path fill="${c0}" d="M150 124c-36 0-64 18-76 50-16 42-20 140-16 252 2 56 0 156-4 240h192c-4-84-6-184-4-240 4-112 0-210-16-252-12-32-40-50-76-50z"/>
      <path fill="${c1}" opacity="0.5" d="M150 124c-12 0-24 3-34 9 20 16 28 40 28 70s-12 54-30 74c14 8 26 16 36 22V124z"/>
      <path fill="none" stroke="${c1}" stroke-width="4" opacity="0.6" d="M150 130v536"/>
      <rect x="112" y="386" width="76" height="18" fill="${c1}" opacity="0.75"/>`
  }

  return `<g>
    ${shadow(150, 962, 108, 16, 0.18)}
    ${legs}
    ${body}
    ${neck}
    ${head}
    ${shoes}
  </g>`
}

function studio(w, h, opts = {}) {
  const { floor = 0.72, tone = 0, arch = false } = opts
  const bg = BACKDROPS[tone % BACKDROPS.length]
  const floorY = h * floor
  const art = `<rect x="0" y="${floorY}" width="${w}" height="${h - floorY}" fill="#111111" opacity="0.07"/>
    <rect x="0" y="${floorY}" width="${w}" height="1.5" fill="#111111" opacity="0.12"/>
    ${
      arch
        ? `<path fill="#ffffff" opacity="0.3" d="M${w / 2 - w * 0.3} ${floorY} V${h * 0.34} a${w * 0.3} ${w * 0.3} 0 0 1 ${w * 0.6} 0 V${floorY} Z"/>`
        : `<rect x="${w * 0.12}" y="${h * 0.1}" width="${w * 0.76}" height="${floorY - h * 0.1}" fill="#ffffff" opacity="0.22"/>`
    }
    ${opts.art ?? ''}`
  return { bg, art }
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
  bg: ['#222222', '#111111'],
  cloth: ['#3A3A38', '#4A4A48'],
  art: `<g fill="none" stroke="#DCDCD8" stroke-width="6" opacity="0.5">
      <path d="M40 40h90v90H40z"/>
    </g>
    <text x="240" y="212" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="112" font-weight="600" letter-spacing="4" fill="#F7F7F5">−50%</text>
    <rect x="150" y="258" width="180" height="2" fill="#DCDCD8" opacity="0.6"/>
    <text x="240" y="308" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" letter-spacing="8" fill="#DCDCD8" opacity="0.85">SALE</text>`,
})

// — collection cards
for (const [slug, art, clothIdx, tone] of COLLECTIONS) {
  const cloth = CLOTH[clothIdx % CLOTH.length]
  const w = 900
  const h = 1200
  const f = figure({
    cloth,
    skin: SKIN[tone % SKIN.length],
    hair: HAIR[tone % HAIR.length],
    longHair: tone % 2 === 0,
    pose: art === 'dress' ? 'dress' : art === 'coat' ? 'coat' : 'wide',
  })
  save(`collections/${slug}.svg`, w, h, {
    ...studio(w, h, {
      floor: 0.78,
      tone,
      arch: true,
      art: `<g transform="${place(w / 2, h * 0.78, 0.86)}">${f}</g>`,
    }),
    cloth,
  })
}

// — hero (desktop wide + mobile portrait)
{
  const w = 2000
  const h = 1250
  const left = figure({ cloth: CLOTH[2], skin: SKIN[1], hair: HAIR[0], longHair: true, pose: 'wide' })
  const right = figure({ cloth: CLOTH[0], skin: SKIN[0], hair: HAIR[2], pose: 'coat' })
  save('hero/hero-desktop.svg', w, h, {
    ...studio(w, h, {
      floor: 0.84,
      tone: 3,
      art: `<g transform="${place(w * 0.53, h * 0.84, 0.9)}">${left}</g>
            <g transform="${place(w * 0.75, h * 0.84, 0.96)}">${right}</g>`,
    }),
    cloth: CLOTH[0],
  })

  const mw = 1000
  const mh = 1400
  const single = figure({ cloth: CLOTH[2], skin: SKIN[1], hair: HAIR[0], longHair: true, pose: 'wide' })
  save('hero/hero-mobile.svg', mw, mh, {
    ...studio(mw, mh, {
      floor: 0.88,
      tone: 3,
      arch: true,
      art: `<g transform="${place(mw / 2, mh * 0.88, 1.04)}">${single}</g>`,
    }),
    cloth: CLOTH[2],
  })
}

// — promo banners
{
  const w = 1200
  const h = 900
  const student = figure({ cloth: CLOTH[13], skin: SKIN[2], hair: HAIR[1], pose: 'coat' })
  const file = save('banners/student.svg', w, h, {
    ...studio(w, h, {
      floor: 0.86,
      tone: 5,
      art: `<g transform="${place(w * 0.68, h * 0.86, 0.68)}">${student}</g>`,
    }),
    cloth: CLOTH[13],
  })

  // re-tint the student card to a dark, photographic treatment
  const raw = readFileSync(file, 'utf8')
  writeFileSync(
    file,
    raw
      .replace('stop-color="#D3CFC5"', 'stop-color="#4A4A48"')
      .replace('stop-color="#BEB9AE"', 'stop-color="#1E1E1D"')
      .replace('stop-color="#ffffff" stop-opacity="0.34"', 'stop-color="#ffffff" stop-opacity="0.13"')
      .replace('stop-color="#111111" stop-opacity="0.14"', 'stop-color="#000000" stop-opacity="0.42"')
      .replace('fill="#ffffff" opacity="0.22"', 'fill="#ffffff" opacity="0.05"'),
  )

  save('banners/new-season.svg', w, h, {
    bg: ['#F7F7F5', '#E8E8E5'],
    cloth: CLOTH[2],
    art: `<g transform="${place(w * 0.7, h * 0.9, 0.68)}">${figure({
      cloth: CLOTH[3],
      skin: SKIN[3],
      hair: HAIR[0],
      longHair: true,
      pose: 'dress',
    })}</g>`,
  })

  save('banners/store.svg', 1200, 900, {
    bg: ['#E9E6E0', '#CFCCC3'],
    cloth: CLOTH[5],
    art: `<rect x="120" y="140" width="440" height="600" fill="#111111" opacity="0.08"/>
      <rect x="150" y="170" width="380" height="540" fill="#F7F7F5" opacity="0.75"/>
      <rect x="180" y="520" width="200" height="26" fill="#111111" opacity="0.5"/>
      <rect x="180" y="600" width="140" height="20" fill="#111111" opacity="0.3"/>
      <circle cx="700" cy="330" r="120" fill="#8C8C7A" opacity="0.5"/>
      <path fill="#5F6B5C" d="M700 450c-10-90-6-160 0-190 6 30 10 100 0 190z"/>
      <path fill="#5F6B5C" opacity="0.8" d="M700 330c-70-30-120-80-128-150 60 20 116 70 128 150z"/>
      <rect x="640" y="600" width="200" height="70" rx="8" fill="#111111" opacity="0.25"/>
      <rect x="880" y="430" width="180" height="240" fill="#111111" opacity="0.07"/>`,
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
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="10" fill="#111111"/><path fill="none" stroke="#F7F7F5" stroke-width="6" stroke-linecap="square" d="M44 22a18 18 0 1 0 0 20"/></svg>`,
)

console.log('✓ original assets written to public/images')
