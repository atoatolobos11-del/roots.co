import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Assets that live in `public/` are referenced with root-absolute paths
// ("/images/...", "/fonts/...") throughout the source. On a sub-path host such
// as https://<user>.github.io/<repo>/ those paths must be prefixed with the
// base, or every image 404s. Rewriting them at build time keeps the source
// readable and avoids threading BASE_URL through the data files.
const PUBLIC_ASSETS = 'images|fonts|favicon\\.svg|og-image\\.png|robots\\.txt|sitemap\\.xml'

function publicAssetBase() {
  // Vite normalises `base` to always end in "/"; read the resolved value rather
  // than the raw env var so the prefix is never missing its separator.
  let base = '/'

  // The leading char is a quote of any kind - '...', "..." or a `...` template
  // literal. The data modules use backticks, so all three must be covered.
  // The look-ahead asserts the asset name ends here (a path or quote follows),
  // which keeps `/favicon.svg` from matching inside `/favicon.svg.bak`.
  const rewrite = (text) => {
    const prefix = base.endsWith('/') ? base : `${base}/`
    // The leading "/" is consumed by the pattern, so it comes back via prefix.
    // renderChunk and generateBundle each run once per build, so a given path
    // can never be prefixed twice.
    // The asset name is matched with a look-ahead, not consumed, so the
    // replacement only inserts the prefix and leaves "/images/..." intact.
    const re = new RegExp(`(["'\`(])\\/(?=(?:${PUBLIC_ASSETS})(?=[/"']))`, 'g')
    return text.replace(re, `$1${prefix}`)
  }

  return {
    name: 'public-asset-base',
    enforce: 'post',
    configResolved(resolved) {
      base = resolved.base || '/'
    },
    // renderChunk runs *before* the chunk's content hash is computed, so a
    // base-path change also changes the emitted filename and busts caches.
    renderChunk(code) {
      return base === '/' ? null : rewrite(code)
    },
    generateBundle(_options, bundle) {
      if (base === '/') return
      // CSS and HTML arrive as assets rather than chunks, so they are handled
      // here instead.
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && file.source && /\.(css|html)$/.test(file.fileName)) {
          file.source = rewrite(String(file.source))
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Root-domain hosts (Vercel, Netlify, a custom domain) need no base path.
  // Set BASE_PATH for a sub-path host such as
  // https://<user>.github.io/<repo>/ - `npm run set:url` prints the value.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), publicAssetBase()],
  build: {
    // The catalogue is static, so assets can safely be inlined when small.
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        // Split the framework out of the app chunk so a copy change does not
        // invalidate the React vendor bundle in the browser cache.
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
