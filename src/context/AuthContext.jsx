import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'rootco.session.v1'

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@roots.co',
    name: 'Admin ROOTS.CO',
    role: 'admin',
    password: 'adminPassword1',
  },
  customer: {
    email: 'customer@roots.co',
    name: 'Eleanor Vance',
    role: 'customer',
    password: 'customerPassword1',
  },
}

/**
 * Client-only demo session with UI-level role checks. Production authorization
 * must be enforced by a trusted server, not browser storage or client code.
 */
function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.email !== 'string') return null
    const isKnownAdmin =
      parsed.email.toLowerCase() === DEMO_ACCOUNTS.admin.email && parsed.role === 'admin'
    return { ...parsed, role: isKnownAdmin ? 'admin' : 'customer' }
  } catch {
    return null
  }
}

export function resolveDemoRole(email, password) {
  const emailClean = email.trim().toLowerCase()
  if (emailClean !== DEMO_ACCOUNTS.admin.email) return 'customer'
  return password === DEMO_ACCOUNTS.admin.password ? 'admin' : null
}

export function isReservedAdminEmail(email) {
  return email.trim().toLowerCase() === DEMO_ACCOUNTS.admin.email
}

function fakeHash(value) {
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
      const emailClean = email.trim().toLowerCase()
      if (isReservedAdminEmail(emailClean)) {
        throw new Error('This email is reserved for the administrator account')
      }
      const session = {
        name: name.trim(),
        email: emailClean,
        role: 'customer',
        joinedAt: new Date().toISOString(),
      }
      persist(session)
      return session
    },
    [persist],
  )

  const signIn = useCallback(
    async ({ email, password }) => {
      const emailClean = email.trim().toLowerCase()
      const assignedRole = resolveDemoRole(emailClean, password)
      if (!assignedRole) throw new Error('Invalid administrator credentials')
      const local = emailClean.split('@')[0].replace(/[._-]+/g, ' ')
      const name = assignedRole === 'admin' ? DEMO_ACCOUNTS.admin.name : local.replace(/\b\w/g, (c) => c.toUpperCase())

      const session = {
        name: name || 'Member',
        email: emailClean,
        role: assignedRole,
        joinedAt: new Date().toISOString(),
      }
      persist(session)
      return session
    },
    [persist],
  )

  const signInAsDemo = useCallback(
    async () => {
      const account = DEMO_ACCOUNTS.customer
      const session = {
        name: account.name,
        email: account.email,
        role: account.role,
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

  const isAdmin = Boolean(
    user &&
      user.role === 'admin' &&
      user.email?.toLowerCase() === DEMO_ACCOUNTS.admin.email,
  )

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      isReady,
      isAuthenticated: Boolean(user),
      signUp,
      signIn,
      signInAsDemo,
      signOut,
    }),
    [user, isAdmin, isReady, signUp, signIn, signInAsDemo, signOut],
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
