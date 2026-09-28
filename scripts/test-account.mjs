/**
 * Account dialog accessibility + validation assertions.
 *
 *   node scripts/test-account.mjs
 *
 * Renders AccountModal to static markup and checks the ARIA wiring that is easy
 * to break in a modal, then exercises the shared field rules. Complements
 * scripts/smoke.mjs, which proves the component renders at all.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const [modal, auth] = await Promise.all([
  server.ssrLoadModule('/src/components/AccountModal.jsx'),
  server.ssrLoadModule('/src/context/AuthContext.jsx'),
])

const { AuthProvider, authRules } = auth

let failed = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failed += 1
}

const render = () =>
  renderToStaticMarkup(
    createElement(AuthProvider, null, createElement(modal.default, { open: true, onClose: () => {} })),
  )

const html = render()

console.log('AccountModal markup:')
check('role=dialog', html.includes('role="dialog"'))
check('aria-modal', html.includes('aria-modal="true"'))
check('aria-labelledby present', html.includes('aria-labelledby="account-title"'))
check('labelledby target exists', html.includes('id="account-title"'))
check('tablist for the mode switch', html.includes('role="tablist"'))
check('exactly one tabpanel', (html.match(/role="tabpanel"/g) ?? []).length === 1)
check('both tabs have aria-selected', (html.match(/aria-selected="/g) ?? []).length === 2)
check('tabs point at the panel', html.includes('aria-controls="account-panel"'))
check('submit button', html.includes('type="submit"'))
check('autofocus target for the focus trap', html.includes('data-autofocus'))
check('decorative shapes hidden from AT', (html.match(/aria-hidden="true"/g) ?? []).length >= 2)
check('heading is not empty', /id="account-title"[^>]*>[^<]+/.test(html))
check('no password value echoed into the DOM', !/<input[^>]*type="password"[^>]*value="[^"]+"/.test(html))
check('valid fields are not marked invalid', !html.includes('aria-invalid="true"'))

// Every input must have a real <label for>. Note the \s: a bare id=" would also
// match the tail of aria-invalid="..." and silently pass the wrong value.
const inputIds = [...html.matchAll(/<input[^>]*?\sid="([^"]+)"/g)].map((m) => m[1])
const labelFor = [...html.matchAll(/<label[^>]*?\sfor="([^"]+)"/g)].map((m) => m[1])
check('inputs rendered', inputIds.length > 0, `${inputIds.length} in sign-in mode`)
check(
  'every input has a matching label',
  inputIds.every((id) => labelFor.includes(id)),
  inputIds.join(', '),
)

console.log('\nauthRules:')
const r = authRules
check('rejects empty email', Boolean(r.email.validate('')))
check('rejects malformed email', Boolean(r.email.validate('not-an-email')))
check('accepts a normal email', r.email.validate('a@b.co') === null, 'a@b.co')
check('rejects short password', Boolean(r.password.validate('abc1')))
check('rejects all-numeric password', Boolean(r.password.validate('12345678')))
check('accepts a strong password', r.password.validate('abcd1234') === null, 'abcd1234')
check('confirm detects mismatch', r.confirmPassword.validate('abcd1235', { password: 'abcd1234' }) !== null)
check('confirm accepts a match', r.confirmPassword.validate('abcd1234', { password: 'abcd1234' }) === null)
check('name rejects one character', Boolean(r.name.validate('a')))
check('name accepts a normal name', r.name.validate('Ada Lovelace') === null, 'Ada Lovelace')

console.log('\nAuthContext:')
const ssr = renderToStaticMarkup(createElement(AuthProvider, null, createElement('span', null, 'ok')))
check('renders during SSR (no localStorage access)', ssr.includes('ok'))

await server.close()
console.log(failed ? `\nFAIL: ${failed} assertion(s)` : '\nPASS: all assertions')
process.exit(failed ? 1 : 0)
