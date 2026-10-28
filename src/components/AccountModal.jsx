import { useEffect, useRef, useState } from 'react'
import { X, ArrowRight, Check, Eye, EyeOff, Mail, Lock, User as UserIcon, Boxes, ShieldCheck } from 'lucide-react'
import { useOverlay } from '../hooks/useOverlay.js'
import { useAuth, authRules } from '../context/AuthContext.jsx'
import { cn } from '../lib/utils.js'

/**
 * Account dialog with a sign-in / sign-up switch (PRD §22 FR-06)
 * and role-based demo accounts (Customer vs Admin).
 */
export default function AccountModal({ open, onClose, onOpenInventory }) {
  const panelRef = useRef(null)
  const { user, isAuthenticated, signIn, signUp, signOut, signInAsDemo } = useAuth()

  const [mode, setMode] = useState('signin')
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | busy | done
  const [showPassword, setShowPassword] = useState(false)

  useOverlay(open, panelRef, onClose)

  // Reset to a clean form each time the dialog is opened.
  useEffect(() => {
    if (!open) return
    setValues({ name: '', email: '', password: '', confirmPassword: '' })
    setErrors({})
    setStatus('idle')
    setShowPassword(false)
  }, [open, mode])

  const isSignUp = mode === 'signup'
  const fields = isSignUp
    ? ['name', 'email', 'password', 'confirmPassword']
    : ['email', 'password']

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
      setStatus('done')
    } catch {
      setStatus('idle')
      setErrors({ form: 'Something went wrong. Please try again.' })
    }
  }

  // Gate on the session, not on `status`: a returning visitor whose session was
  // restored from localStorage has never submitted the form in this mount.
  const signedIn = isAuthenticated

  return (
    <div
      className={cn(
        'fixed inset-0 z-[75] flex items-end justify-center sm:items-center sm:p-6',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ease-soft',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        className={cn(
          'on-dark relative w-full max-w-md overflow-hidden bg-white shadow-2xl',
          'transition-transform duration-400 ease-soft',
          'max-sm:rounded-t-2xl sm:rounded-2xl',
          open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.98] opacity-0',
        )}
      >
        {signedIn ? (
          <SignedIn
            user={user}
            onClose={onClose}
            onSignOut={signOut}
            onOpenInventory={onOpenInventory}
          />
        ) : (
          <>
            {/* Decorative header band */}
            <div className="on-dark relative h-28 overflow-hidden bg-ink sm:h-32">
              <div
                aria-hidden="true"
                className="absolute -left-8 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-2xl animate-drift-slow"
              />
              <div
                aria-hidden="true"
                className="absolute -right-6 top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl animate-drift"
              />
              <div className="absolute inset-0 flex items-end justify-between px-6 pb-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-label text-white/60">
                    ROOT.CO account
                  </p>
                  <h2
                    id="account-title"
                    className="mt-1 text-xl font-semibold uppercase tracking-tight text-white"
                  >
                    {isSignUp ? 'Create account' : 'Welcome back'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close account dialog"
                  className="rounded-full p-2 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Mode switch */}
            <div className="grid grid-cols-2 border-b border-line" role="tablist" aria-label="Account mode">
              {[
                ['signin', 'Sign in'],
                ['signup', 'Create account'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`account-tab-${id}`}
                  aria-selected={mode === id}
                  aria-controls="account-panel"
                  onClick={() => setMode(id)}
                  className={cn(
                    'relative px-4 py-3.5 text-[11px] font-semibold uppercase tracking-label transition-colors duration-200',
                    mode === id ? 'text-ink' : 'text-ash hover:text-ink',
                  )}
                >
                  {label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink transition-transform duration-300 ease-soft',
                      mode === id ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </button>
              ))}
            </div>

            <form
              id="account-panel"
              role="tabpanel"
              aria-labelledby={`account-tab-${mode}`}
              onSubmit={onSubmit}
              noValidate
              className="space-y-4 px-6 py-6"
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
                            {showPassword ? (
                              <EyeOff size={16} strokeWidth={1.5} />
                            ) : (
                              <Eye size={16} strokeWidth={1.5} />
                            )}
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
                  At least 8 characters, including a letter and a number. This is a portfolio demo —
                  no account is created and nothing is sent anywhere.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'busy'}
                data-autofocus
                className="btn-dark w-full disabled:opacity-60"
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
                {isSignUp ? 'Already have an account?' : 'New to ROOT.CO?'}{' '}
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
                    onClick={async () => {
                      await signInAsDemo('customer')
                      onClose()
                    }}
                    className="flex flex-col items-center justify-center rounded-lg border border-line bg-off/40 p-2 text-center transition-colors duration-200 hover:bg-off hover:border-ink"
                  >
                    <span className="text-[11px] font-semibold text-ink">Customer Account</span>
                    <span className="text-[9px] text-ash">Regular shopper (no inventory)</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await signInAsDemo('admin')
                      onClose()
                    }}
                    className="flex flex-col items-center justify-center rounded-lg border border-ink bg-ink p-2 text-center text-white transition-colors duration-200 hover:bg-neutral-800"
                  >
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
                      <ShieldCheck size={12} strokeWidth={2} /> Admin Account
                    </span>
                    <span className="text-[9px] text-white/70">Full inventory access</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const ICONS = { name: UserIcon, email: Mail, password: Lock, confirmPassword: Lock }

function Field({
  name,
  type,
  value,
  error,
  onChange,
  autoComplete,
  trailing,
  style,
}) {
  const id = `account-${name}`
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
        {trailing && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[11px] text-accent">
          {error}
        </p>
      )}
    </div>
  )
}

function SignedIn({ user, onClose, onSignOut, onOpenInventory }) {
  const { isAdmin, signInAsDemo } = useAuth()

  return (
    <div className="px-6 py-8 text-center">
      <span className="mx-auto flex h-14 w-14 animate-pop items-center justify-center rounded-full bg-ink text-white">
        <Check size={24} strokeWidth={2} />
      </span>
      <h2 id="account-title" className="mt-5 text-lg font-semibold uppercase tracking-tight">
        You&rsquo;re signed in
      </h2>
      <p className="mt-2 text-sm text-ash">{user.email}</p>

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

      {/* Admin Quick Action */}
      {isAdmin && onOpenInventory && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenInventory()
            }}
            className="btn-dark w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-label"
          >
            <Boxes size={15} strokeWidth={1.8} />
            Open Inventory System
          </button>
        </div>
      )}

      {/* Role Switcher */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-ash">
        <span>Switch demo role:</span>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => signInAsDemo('customer')}
            className="font-semibold text-ink underline underline-offset-2 hover:text-accent"
          >
            Switch to Customer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => signInAsDemo('admin')}
            className="font-semibold text-ink underline underline-offset-2 hover:text-accent"
          >
            Switch to Admin
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={onClose} className="btn-dark flex-1">
          Continue shopping
        </button>
        <button type="button" onClick={onSignOut} className="btn-outline flex-1">
          Sign out
        </button>
      </div>
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
