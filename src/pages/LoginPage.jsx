import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
  Boxes,
} from 'lucide-react'
import Wordmark from '../components/Wordmark.jsx'
import { useAuth, authRules } from '../context/AuthContext.jsx'
import { OPEN_INVENTORY_FLAG } from '../context/InventoryContext.jsx'
import { navigate, HOME } from '../routes.js'
import { cn } from '../lib/utils.js'

/**
 * Standalone sign-in / sign-up page at /login (PRD §22 FR-06), replacing the
 * old account modal. Kept visually in step with the site: warm tonal palette,
 * ink branding panel and the same demo accounts.
 */

const MEMBER_PERKS = [
  { icon: Truck, title: 'Free express delivery', copy: 'Complimentary on every order over $150' },
  { icon: RefreshCw, title: '30-day easy returns', copy: 'Full refunds, no questions asked' },
  { icon: Sparkles, title: 'Early access to drops', copy: 'Members see new arrivals first' },
]

export default function LoginPage() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-off">
      <header className="border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="shell flex h-14 items-center justify-between gap-4 lg:h-16">
          <a
            href={HOME}
            onClick={(event) => {
              event.preventDefault()
              navigate(HOME)
            }}
            className="px-1 py-2"
            aria-label="ROOTS.CO — back to the store"
          >
            <Wordmark />
          </a>
          <button
            type="button"
            onClick={() => navigate(HOME)}
            className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-label text-ink transition-colors duration-200 hover:border-ink"
          >
            <ArrowLeft size={13} strokeWidth={1.8} />
            Back to store
          </button>
        </div>
      </header>

      <main id="main" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm lg:grid-cols-2">
          {/* Branding panel */}
          <aside
            aria-hidden="true"
            className="on-dark relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex"
          >
            <div className="absolute -left-10 -top-12 h-48 w-48 rounded-full bg-accent/25 blur-2xl animate-drift-slow" />
            <div className="absolute -right-8 top-24 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-drift" />
            <div className="relative">
              <p className="text-[10px] font-medium uppercase tracking-label text-white/60">Member access</p>
              <h1 className="mt-2 text-2xl font-semibold uppercase tracking-tight">Where the originals stay rooted.</h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                Sign in to check out faster, track orders and keep your wishlist synced across every session.
              </p>
            </div>
            <ul className="relative space-y-4">
              {MEMBER_PERKS.map(({ icon: Icon, title, copy }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent">
                    <Icon size={16} strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold">{title}</p>
                    <p className="text-xs text-white/60">{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* Auth area */}
          <div className="flex items-center justify-center p-6 sm:p-10">
            {isAuthenticated ? <AccountProfile user={user} /> : <AuthForm />}
          </div>
        </div>
      </main>
    </div>
  )
}

function AuthForm() {
  const { signIn, signUp, signInAsDemo } = useAuth()

  const [mode, setMode] = useState('signin') // signin | signup
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | busy | done
  const [showPassword, setShowPassword] = useState(false)

  // Reset to a clean form whenever the mode flips.
  useEffect(() => {
    setValues({ name: '', email: '', password: '', confirmPassword: '' })
    setErrors({})
    setStatus('idle')
    setShowPassword(false)
  }, [mode])

  const isSignUp = mode === 'signup'
  const fields = isSignUp ? ['name', 'email', 'password', 'confirmPassword'] : ['email', 'password']

  const setField = (key) => (event) => {
    const { value } = event.target
    setValues((prev) => ({ ...prev, [key]: value }))
    // Clear the error as soon as the user starts fixing it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev))
  }

  const validate = () => {
    const next = {}
    for (const key of fields) {
      const error = authRules[key].validate(values[key], values)
      if (error) next[key] = error
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (status === 'busy') return
    if (!validate()) return

    setStatus('busy')
    try {
      if (isSignUp) {
        await signUp({ name: values.name, email: values.email, password: values.password })
      } else {
        await signIn({ email: values.email, password: values.password })
      }
      // Signed in — land back in the shop.
      navigate(HOME)
    } catch {
      setStatus('idle')
      setErrors({ form: 'Something went wrong. Please try again.' })
    }
  }

  const handleDemoCustomer = async () => {
    await signInAsDemo('customer')
    navigate(HOME)
  }

  const handleDemoAdmin = async () => {
    const session = await signInAsDemo('admin')
    // Drop the administrator straight into the inventory dashboard.
    if (session?.role === 'admin') {
      try {
        window.sessionStorage.setItem(OPEN_INVENTORY_FLAG, '1')
      } catch {
        /* private mode — sign-in still works, just no auto-open */
      }
    }
    navigate(HOME)
  }

  return (
    <div className="w-full max-w-sm">
      <h2 id="login-title" className="text-xl font-semibold uppercase tracking-tight text-ink">
        {isSignUp ? 'Create account' : 'Welcome back'}
      </h2>
      <p className="mt-1.5 text-xs text-ash">
        {isSignUp ? 'Join ROOTS.CO for member-first shopping.' : 'Sign in to continue to the store.'}
      </p>

      {/* Mode switch */}
      <div className="mt-5 grid grid-cols-2 rounded-lg border border-line bg-off/60 p-1" role="tablist" aria-label="Account mode">
        {[
          ['signin', 'Sign in'],
          ['signup', 'Create account'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`login-tab-${id}`}
            aria-selected={mode === id}
            aria-controls="login-panel"
            onClick={() => setMode(id)}
            className={cn(
              'rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-label transition-colors duration-200',
              mode === id ? 'bg-ink text-white shadow-sm' : 'text-ash hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        id="login-panel"
        role="tabpanel"
        aria-labelledby={`login-tab-${mode}`}
        onSubmit={onSubmit}
        noValidate
        className="mt-5 space-y-4"
      >
        {fields.map((key, index) => (
          <Field
            key={key}
            name={key}
            type={key === 'password' || key === 'confirmPassword' ? 'password' : 'text'}
            value={values[key]}
            error={errors[key]}
            autoComplete={authRules[key].autoComplete}
            onChange={setField(key)}
            style={{ animationDelay: `${index * 70}ms` }}
            {...(key === 'password' || key === 'confirmPassword'
              ? {
                  trailing: (
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-ash transition-colors duration-200 hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                    </button>
                  ),
                }
              : {})}
          />
        ))}

        {errors.form && (
          <p role="alert" className="text-[11px] text-accent">
            {errors.form}
          </p>
        )}

        {isSignUp && (
          <p className="text-[11px] leading-relaxed text-ash">
            At least 8 characters, including a letter and a number. Include &ldquo;admin&rdquo; in the email to get
            administrator access.
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'busy'}
          data-autofocus
          className="btn-dark flex w-full items-center justify-center gap-2 disabled:opacity-60"
        >
          {status === 'busy' ? (
            <>
              <Spinner />
              {isSignUp ? 'Creating account' : 'Signing in'}
            </>
          ) : (
            <>
              {isSignUp ? 'Create account' : 'Sign in'}
              <ArrowRight size={15} strokeWidth={1.5} />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-ash">
          {isSignUp ? 'Already have an account?' : 'New to ROOTS.CO?'}{' '}
          <button
            type="button"
            onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
            className="font-semibold text-ink underline underline-offset-4 transition-colors duration-200 hover:text-accent"
          >
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        {/* Demo Accounts Quick Login */}
        <div className="border-t border-line pt-3">
          <p className="text-center text-[10px] font-semibold uppercase tracking-label text-ash">
            One-Click Demo Accounts
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="flex flex-col items-center justify-center rounded-lg border border-line bg-off/40 p-2 text-center transition-colors duration-200 hover:border-ink hover:bg-off"
            >
              <span className="text-[11px] font-semibold text-ink">Customer Account</span>
              <span className="text-[9px] text-ash">Regular shopper (no inventory)</span>
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="flex flex-col items-center justify-center rounded-lg border border-ink bg-ink p-2 text-center text-white transition-colors duration-200 hover:bg-neutral-800"
            >
              <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
                <ShieldCheck size={12} strokeWidth={2} /> Admin Account
              </span>
              <span className="text-[9px] text-white/70">Opens the inventory dashboard</span>
            </button>
          </div>
        </div>
      </form>

      <p className="mt-5 text-center text-[10px] leading-relaxed text-ash">
        Demo store &mdash; sessions are stored in this browser only.
      </p>
    </div>
  )
}

function AccountProfile({ user }) {
  const { isAdmin, signOut, toggleRole } = useAuth()

  const openInventoryDashboard = () => {
    try {
      window.sessionStorage.setItem(OPEN_INVENTORY_FLAG, '1')
    } catch {
      /* private mode — just navigate home */
    }
    navigate(HOME)
  }

  return (
    <div className="w-full max-w-sm text-center">
      <span className="mx-auto flex h-14 w-14 animate-pop items-center justify-center rounded-full bg-ink text-white">
        <Check size={24} strokeWidth={2} />
      </span>
      <h2 id="login-title" className="mt-5 text-xl font-semibold uppercase tracking-tight text-ink">
        You&rsquo;re signed in
      </h2>
      <p className="mt-1.5 text-xs text-ash">{user.email}</p>

      <dl className="mt-6 space-y-2 rounded-xl bg-off p-4 text-left text-[11px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ash">Name</dt>
          <dd className="font-medium">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ash">Role</dt>
          <dd className="font-medium">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-label',
                isAdmin ? 'bg-ink text-white' : 'bg-line text-ink',
              )}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck size={11} strokeWidth={2} />
                  Administrator
                </>
              ) : (
                'Customer'
              )}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ash">Member since</dt>
          <dd className="font-medium">
            {new Date(user.joinedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ash">Status</dt>
          <dd className="font-medium">Demo session — stored in this browser only</dd>
        </div>
      </dl>

      {isAdmin ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={openInventoryDashboard}
            className="btn-dark flex w-full items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-label shadow-sm"
          >
            <Boxes size={15} strokeWidth={1.8} />
            Open Inventory System
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-line bg-mist/30 p-3 text-left">
          <p className="text-[11px] text-ash">Need inventory access? Switch this account to Administrator:</p>
          <button
            type="button"
            onClick={toggleRole}
            className="mt-2 w-full rounded-md border border-ink bg-white py-1.5 text-xs font-semibold uppercase tracking-label text-ink transition-colors duration-200 hover:bg-ink hover:text-white"
          >
            Switch to Administrator Role
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate(HOME)}
          className="btn-dark flex w-full items-center justify-center gap-2"
        >
          Continue shopping
          <ArrowRight size={14} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={signOut} className="btn-outline w-full">
          Sign out
        </button>
      </div>
    </div>
  )
}

const ICONS = { name: UserIcon, email: Mail, password: Lock, confirmPassword: Lock }

function Field({ name, type, value, error, onChange, autoComplete, trailing, style }) {
  const id = `login-${name}`
  const errorId = `${id}-error`
  const Icon = ICONS[name]

  return (
    <div className="animate-rise" style={style}>
      <label htmlFor={id} className="label">
        {authRules[name].label}
      </label>
      <div className="relative mt-1.5">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash">
            <Icon size={15} strokeWidth={1.5} />
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full border bg-white py-2.5 text-sm text-ink outline-none transition-colors duration-200',
            'placeholder:text-ash/60 focus:border-ink',
            Icon ? 'pl-9' : 'pl-3',
            trailing ? 'pr-10' : 'pr-3',
            error ? 'border-accent' : 'border-line',
          )}
        />
        {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[11px] text-accent">
          {error}
        </p>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeWidth="3" stroke="currentColor" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" />
    </svg>
  )
}
