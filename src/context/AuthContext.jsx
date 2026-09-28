import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'rootco.session.v1'

/**
 * Client-only demo session.
 *
 * There is no backend: sign-up and sign-in validate input, then persist a
 * session object to localStorage. Nothing is verified, no password is stored
 * beyond a fake hash, and no request leaves the browser. Swapping this for a
 * real API means replacing the two async calls below and nothing else.
 */
function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Private browsing or a corrupted entry: treat as signed out rather than
    // letting a parse error take the whole app down.
    return null
  }
}

function fakeHash(value) {
  // Not a real hash. It exists only so the demo never writes a plaintext
  // password into localStorage, where it would be trivially readable.
  let out = 0
  for (let i = 0; i < value.length; i += 1) {
    out = (out * 31 + value.charCodeAt(i)) | 0
  }
  return String(out)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)

  // Read after mount: localStorage does not exist during SSR.
  useEffect(() => {
    setUser(readStoredSession())
    setIsReady(true)
  }, [])

  // Keep tabs in sync when the session changes in another tab.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setUser(readStoredSession())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((session) => {
    setUser(session)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // Storage full or blocked: the session still works for this tab.
    }
  }, [])

  const signUp = useCallback(
    async ({ name, email }) => {
      const session = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        joinedAt: new Date().toISOString(),
      }
      persist(session)
      return session
    },
    [persist],
  )

  const signIn = useCallback(
    async ({ email }) => {
      // No credential check - there is nothing to check against. Deriving the
      // name from the email keeps the header plausible without inventing data.
      const local = email.split('@')[0].replace(/[._-]+/g, ' ')
      const name = local.replace(/\b\w/g, (c) => c.toUpperCase())
      const session = {
        name: name || 'Member',
        email: email.trim().toLowerCase(),
        joinedAt: new Date().toISOString(),
      }
      persist(session)
      return session
    },
    [persist],
  )

  const signOut = useCallback(() => {
    setUser(null)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* nothing to clean up */
    }
  }, [])

  const value = useMemo(
    () => ({ user, isReady, isAuthenticated: Boolean(user), signUp, signIn, signOut }),
    [user, isReady, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

/** Field rules, shared by the form and its inline validation. */
export const authRules = {
  name: {
    label: 'Full name',
    autoComplete: 'name',
    validate: (value) => {
      const v = value.trim()
      if (!v) return 'Enter your name'
      if (v.length < 2) return 'Name must be at least 2 characters'
      if (v.length > 60) return 'Name must be 60 characters or fewer'
      return null
    },
  },
  email: {
    label: 'Email',
    autoComplete: 'email',
    // Deliberately permissive: the goal is to catch typos, not to enforce
    // RFC 5322. A strict pattern rejects valid real addresses.
    validate: (value) => {
      const v = value.trim()
      if (!v) return 'Enter your email'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address'
      return null
    },
  },
  password: {
    label: 'Password',
    autoComplete: 'current-password',
    validate: (value) => {
      const v = value
      if (!v) return 'Enter your password'
      if (v.length < 8) return 'Password must be at least 8 characters'
      if (!/[a-zA-Z]/.test(v)) return 'Include at least one letter'
      if (!/\d/.test(v)) return 'Include at least one number'
      return null
    },
  },
  confirmPassword: {
    label: 'Confirm password',
    autoComplete: 'new-password',
    validate: (value, all) => {
      if (!value) return 'Re-enter your password'
      if (value !== all.password) return 'Passwords do not match'
      return null
    },
  },
}

export { fakeHash }
