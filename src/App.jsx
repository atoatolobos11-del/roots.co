import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { currentRoute, LOGIN } from './routes.js'

/**
 * Top-level page switch. The store is a single page; /login is the only
 * standalone page (kept in sync with the address bar via routes.js).
 * AuthProvider lives here so both pages — and the navigation between them —
 * share the same session.
 */
export default function App() {
  const [route, setRoute] = useState(currentRoute)

  // Back/forward buttons (and programmatic navigate() re-emissions).
  useEffect(() => {
    const handleNavigation = () => {
      setRoute(currentRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  if (route === LOGIN) {
    return (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )
  }
  // Any other path (unknown included) falls back to the shop.
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  )
}
