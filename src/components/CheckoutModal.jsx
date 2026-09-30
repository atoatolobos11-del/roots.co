import { useRef, useState } from 'react'
import { X, Check, ArrowLeft, ArrowRight, Lock, Truck, PackageCheck } from 'lucide-react'
import { useOverlay } from '../hooks/useOverlay.js'
import { useCheckout } from '../context/CheckoutContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { FREE_SHIPPING_THRESHOLD } from '../data/site.js'
import { formatPrice, cn } from '../lib/utils.js'

/** Base rates; standard goes free at the threshold, checked where it is used. */
const SHIPPING = {
  standard: { label: 'Standard', detail: '3–5 business days', price: 6 },
  express: { label: 'Express', detail: '1–2 business days', price: 14 },
  priority: { label: 'Priority', detail: 'Next business day', price: 24 },
}

/**
 * Three-step demo checkout (contact → delivery → confirmation).
 *
 * Nothing is sent anywhere and no card field exists: the payment row is a static
 * list of accepted brands. Placing the order clears the cart, so the button
 * changes real state rather than just closing a dialog.
 */
export default function CheckoutModal() {
  const panelRef = useRef(null)
  const checkout = useCheckout()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [errors, setErrors] = useState({})

  useOverlay(checkout.isOpen, panelRef, checkout.closeCheckout)

  const { step, draft, order } = checkout
  const shipping = SHIPPING[draft.shipping]
  const shippingCost = draft.shipping === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shipping.price
  const total = subtotal + shippingCost

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    checkout.update(key, value)
    setErrors((current) => (current[key] ? { ...current, [key]: null } : current))
  }

  const validateContact = () => {
    const next = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email.trim())) next.email = 'Enter a valid email'
    if (draft.name.trim().length < 2) next.name = 'Enter your name'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateDelivery = () => {
    const next = {}
    if (draft.address.trim().length < 4) next.address = 'Enter your street address'
    if (draft.city.trim().length < 2) next.city = 'Enter your city'
    if (draft.postcode.trim().length < 3) next.postcode = 'Enter your postcode'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onContinue = () => {
    if (step === 'contact' && !validateContact()) return
    if (step === 'delivery' && !validateDelivery()) return
    checkout.next()
  }

  const onPlaceOrder = () => {
    checkout.next() // sets the reference and moves to 'done'
    clearCart()
  }

  const stepIndex = checkout.steps.indexOf(step)
  const titles = { contact: 'Contact details', delivery: 'Delivery', done: 'Order confirmed' }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[78] flex items-end justify-center sm:items-center sm:p-6',
        checkout.isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!checkout.isOpen}
    >
      <div
        onClick={checkout.closeCheckout}
        className={cn(
          'absolute inset-0 bg-ink/60 backdrop-blur-[3px] transition-opacity duration-300 ease-soft',
          checkout.isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className={cn(
          'on-dark relative flex max-h-[90svh] w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl',
          'transition-transform duration-300 ease-soft sm:rounded-2xl max-sm:rounded-t-2xl',
          checkout.isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.98] opacity-0',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="label">Checkout</p>
            <h2 id="checkout-title" className="mt-1 text-[17px] font-semibold uppercase tracking-tight">
              {titles[step]}
            </h2>
          </div>
          <button
            type="button"
            onClick={checkout.closeCheckout}
            aria-label="Close checkout"
            className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-ash transition-colors duration-200 hover:bg-off hover:text-ink"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {step !== 'done' && (
          <ol className="flex items-center gap-2 border-b border-line px-5 py-3 sm:px-7">
            {checkout.steps.slice(0, 2).map((id, i) => {
              const state = i < stepIndex ? 'done' : i === stepIndex ? 'current' : 'todo'
              return (
                <li key={id} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold',
                      state === 'todo' ? 'border border-line text-ash' : 'bg-ink text-white',
                    )}
                    aria-hidden="true"
                  >
                    {state === 'done' ? <Check size={11} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn('text-[10px] uppercase tracking-label', state === 'todo' ? 'text-ash' : 'text-ink')}>
                    {titles[id]}
                  </span>
                  {i === 0 && <span className="ml-auto h-px flex-1 bg-line" aria-hidden="true" />}
                </li>
              )
            })}
            <span className="sr-only" aria-live="polite">
              Step {stepIndex + 1} of 2: {titles[step]}
            </span>
          </ol>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {step === 'contact' && (
            <div className="grid gap-5 sm:grid-cols-[1fr_240px]">
              <div className="space-y-4">
                {user && (
                  <p className="bg-off px-3 py-2.5 text-[11px] text-ash">
                    Signed in as <strong className="font-medium text-ink">{user.email}</strong>
                  </p>
                )}
                <Field
                  id="checkout-email"
                  label="Email"
                  type="email"
                  value={draft.email}
                  onChange={set('email')}
                  error={errors.email}
                  autoComplete="email"
                />
                <Field
                  id="checkout-name"
                  label="Full name"
                  value={draft.name}
                  onChange={set('name')}
                  error={errors.name}
                  autoComplete="name"
                />
                <Checkbox
                  id="checkout-newsletter"
                  checked={draft.newsletter}
                  onChange={set('newsletter')}
                  label="Email me new drops and restocks"
                />
              </div>
              <Summary subtotal={subtotal} shippingCost={shippingCost} total={total} items={items} />
            </div>
          )}

          {step === 'delivery' && (
            <div className="grid gap-5 sm:grid-cols-[1fr_240px]">
              <div className="space-y-4">
                <Field
                  id="checkout-address"
                  label="Street address"
                  value={draft.address}
                  onChange={set('address')}
                  error={errors.address}
                  autoComplete="street-address"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="checkout-city"
                    label="City"
                    value={draft.city}
                    onChange={set('city')}
                    error={errors.city}
                    autoComplete="address-level2"
                  />
                  <Field
                    id="checkout-postcode"
                    label="Postcode"
                    value={draft.postcode}
                    onChange={set('postcode')}
                    error={errors.postcode}
                    autoComplete="postal-code"
                  />
                </div>
                <fieldset>
                  <legend className="label">Delivery speed</legend>
                  <div className="mt-2 space-y-2">
                    {Object.entries(SHIPPING).map(([id, option]) => {
                      const price =
                        id === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : option.price
                      return (
                        <label
                          key={id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 border px-3.5 py-3 transition-colors duration-200',
                            draft.shipping === id ? 'border-ink bg-off' : 'border-line hover:border-ink',
                          )}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={id}
                            checked={draft.shipping === id}
                            onChange={set('shipping')}
                            className="sr-only"
                          />
                          <Truck size={15} strokeWidth={1.5} className="text-ash" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-medium">{option.label}</span>
                            <span className="block text-[11px] text-ash">{option.detail}</span>
                          </span>
                          <span className="text-[12px] tabular-nums">
                            {price === 0 ? 'Free' : formatPrice(price)}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
                <Checkbox
                  id="checkout-gift"
                  checked={draft.gift}
                  onChange={set('gift')}
                  label="This is a gift — omit prices on the receipt"
                />

                <div className="border border-line bg-off px-4 py-3.5">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-label">
                    <Lock size={13} strokeWidth={1.5} aria-hidden="true" /> Payment
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ash">
                    This is a portfolio demo, so there is no payment field and no card is ever
                    requested. Accepted in the real store: Visa, Mastercard, Amex, PayPal.
                  </p>
                </div>
              </div>
              <Summary subtotal={subtotal} shippingCost={shippingCost} total={total} items={items} />
            </div>
          )}

          {step === 'done' && order && (
            <div className="py-2 text-center">
              <span className="mx-auto flex h-14 w-14 animate-pop items-center justify-center rounded-full bg-ink text-white">
                <Check size={26} strokeWidth={2} />
              </span>
              <h3 className="mt-5 text-[15px] font-semibold uppercase tracking-tight">Thank you</h3>
              <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-ash">
                Your order reference is{' '}
                <strong className="font-medium tabular-nums text-ink">{order.reference}</strong>. A
                confirmation would be on its way to {order.email}.
              </p>
              <dl className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl bg-off p-4 text-left text-[11px]">
                <Row label="Name" value={order.name} />
                <Row label="Ship to" value={`${order.address}, ${order.city} ${order.postcode}`} />
                <Row label="Delivery" value={SHIPPING[order.shipping].label} />
                <Row label="Total" value={formatPrice(total)} />
              </dl>
              <p className="mt-5 text-[11px] text-ash">
                Portfolio project — no order was placed and nothing was charged.
              </p>
            </div>
          )}
        </div>

        {step !== 'done' ? (
          <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={step === 'contact' ? checkout.closeCheckout : checkout.back}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-label text-ash transition-colors duration-200 hover:text-ink"
            >
              {step === 'delivery' && <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />}
              {step === 'contact' ? 'Back to bag' : 'Back'}
            </button>
            <button type="button" onClick={step === 'delivery' ? onPlaceOrder : onContinue} data-autofocus className="btn-dark">
              {step === 'delivery' ? (
                <>
                  <PackageCheck size={15} strokeWidth={1.5} aria-hidden="true" />
                  Place order
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={15} strokeWidth={1.5} />
                </>
              )}
            </button>
          </footer>
        ) : (
          <footer className="flex justify-end border-t border-line px-5 py-4 sm:px-7">
            <button type="button" onClick={checkout.closeCheckout} data-autofocus className="btn-dark">
              Continue shopping
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

function Summary({ subtotal, shippingCost, total, items }) {
  return (
    <aside className="h-fit border border-line bg-off p-4 sm:sticky sm:top-0">
      <h3 className="label">Order summary</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={`${item.productId}-${item.size}`} className="flex gap-2 text-[11px]">
            <span className="tabular-nums text-ash">{item.quantity}×</span>
            <span className="min-w-0 flex-1 truncate">{item.product.name}</span>
            <span className="tabular-nums">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-[11px]">
        <div className="flex justify-between">
          <dt className="text-ash">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ash">Shipping</dt>
          <dd className="tabular-nums">
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-[13px] font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>
    </aside>
  )
}

function Field({ id, label, value, onChange, error, type = 'text', autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'mt-1.5 w-full border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors duration-200',
          'focus:border-ink placeholder:text-ash/60',
          error ? 'border-accent' : 'border-line',
        )}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[11px] text-accent">
          {error}
        </p>
      )}
    </div>
  )
}

function Checkbox({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-[11px] text-ash">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#1C1917]"
      />
      {label}
    </label>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ash">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  )
}
