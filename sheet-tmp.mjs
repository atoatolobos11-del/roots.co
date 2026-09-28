import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'C:/Users/OJT/AppData/Local/Temp/opencode/pool'
const pool = JSON.parse(readFileSync(join(DIR, 'pool.json'), 'utf8'))

const CELL = 200
const COLS = 6
const ok = []

for (let i = 0; i < pool.length; i += 1) {
  const p = pool[i]
  try {
    const res = await fetch(p.url, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) continue
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.startsWith('image/')) continue
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 8000) continue
    const img = sharp(buf).resize(CELL, CELL, { fit: 'cover' })
    ok.push({ i, buf: await img.png().toBuffer() })
    p.bytes = buf.length
    p.contentType = ct
  } catch {
    /* unreachable candidate, skip */
  }
}

console.log(`downloaded+rendered ${ok.length} of ${pool.length}`)

const rows = Math.ceil(ok.length / COLS)
const sheet = await sharp({
  create: { width: COLS * CELL, height: rows * CELL, channels: 3, background: '#ffffff' },
})
  .composite(ok.map((o, n) => ({ input: o.buf, left: (n % COLS) * CELL, top: Math.floor(n / COLS) * CELL })))
  .png()
  .toBuffer()

mkdirSync(DIR, { recursive: true })
await sharp(sheet).toFile(join(DIR, 'sheet.png'))
// index order for the grid above
writeIndex(ok.map((o) => o.i))
console.log('sheet.png written')

function writeIndex(indices) {
  const lines = indices.map((poolIdx, cell) => {
    const p = pool[poolIdx]
    return `${cell}\t${poolIdx}\t${p.source}\t${(p.bytes / 1024).toFixed(0)}kB\t${p.title}`
  })
  writeFileSafe(join(DIR, 'index.tsv'), lines.join('\n'))
}
function writeFileSafe(p, s) {
  // eslint-disable-next-line no-undef
  import('node:fs').then((fs) => fs.writeFileSync(p, s))
}
