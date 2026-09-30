import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const CheckoutContext = createContext(null)

/**
 * Demo checkout. Three steps — contact, delivery, confirmation — so the cart's
 * Checkout button leads somewhere real instead of dead-ending.
 *
 * No payment is taken and nothing is submitted anywhere. Card details are never
 * read: the card field is a static illustration of accepted brands, not an
 * input, precisely so this cannot be mistaken for a working form.
 */
const STEPS = ['contact', 'delivery', 'done']

const initialDraft = {
  email: '',
  name: '',
  address: '',
  city: '',
  postcode: '',
  country: 'United States',
  shipping: 'standard',
  gift: false,
  newsletter: false,
}

export function CheckoutProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(STEPS[0])
  const [draft, setDraft] = useState(initialDraft)
  const [order, setOrder] = useState(null)

  const openCheckout = useCallback(() => {
    setDraft(initialDraft)
    setOrder(null)
    setStep(STEPS[0])
    setIsOpen(true)
  }, [])

  const closeCheckout = useCallback(() => setIsOpen(false), [])

  const update = useCallback((key, value) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }, [])

  /** Advances a step and, on the last one, records the order reference. */
  const next = useCallback(() => {
    setStep((current) => {
      const index = STEPS.indexOf(current)
      if (index === STEPS.length - 1) return current
      const nextStep = STEPS[index + 1]
      if (nextStep === 'done') {
        // Deterministic-looking reference derived from the timestamp, so two
        // orders in the same minute still read differently.
        const ref = `RC-${Date.now().toString(36).toUpperCase().slice(-6)}`
        setOrder({ ...draft, reference: ref })
      }
      return nextStep
    })
  }, [draft])

  const back = useCallback(() => {
    setStep((current) => {
      const index = STEPS.indexOf(current)
      return index > 0 ? STEPS[index - 1] : current
    })
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      step,
      steps: STEPS,
      draft,
      order,
      update,
      next,
      back,
      openCheckout,
      closeCheckout,
      /** Called after the cart is cleared when the order is placed. */
      complete: () => {
        setStep('done')
        setIsOpen(false)
      },
    }),
    [isOpen, step, draft, order, update, next, back, openCheckout, closeCheckout],
  )

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) throw new Error('useCheckout must be used inside <CheckoutProvider>')
  return context
}

export { STEPS as CHECKOUT_STEPS }
