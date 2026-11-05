/**
 * Tiny path router — the shop is a single page plus a standalone login page,
 * so a full routing library would be overkill. History is kept in sync so
 * /login is shareable, refreshable (SPA fallbacks in nginx/vercel.json) and
 * supports browser back/forward via popstate.
 */
export const HOME = '/'
export const LOGIN = '/login'

/** Normalised current path ('/login/' → '/login', '' → '/'). */
export function currentRoute() {
  if (typeof window === 'undefined') return HOME
  return window.location.pathname.replace(/\/+$/, '') || HOME
}

/** Programmatic navigation (same as pushing a page + popping back). */
export function navigate(path) {
  if (typeof window === 'undefined') return
  if (window.location.pathname === path) return
  window.history.pushState({}, '', path)
  // The app listens for popstate; re-emit it so our own changes update too.
  window.dispatchEvent(new PopStateEvent('popstate'))
}
