'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

type DeliveryZone = {
  id: string
  name: string
  estimatedDays: string
  fee: number
}

type Props = {
  zones: DeliveryZone[]
}

const PAYMENT_METHODS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'vodafone_cash', label: 'Vodafone Cash' },
  { value: 'airteltigo_money', label: 'AirtelTigo Money' },
  { value: 'card', label: 'Card' },
] as const

export function CheckoutForm({ zones }: Props) {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryZoneId: zones[0]?.id ?? '',
    deliveryAddress: '',
    paymentMethod: 'mtn_momo' as 'mtn_momo' | 'vodafone_cash' | 'airteltigo_money' | 'card',
  })

  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  const selectedZone = zones.find((z) => z.id === form.deliveryZoneId)
  const deliveryFee = selectedZone?.fee ?? 0
  const sub = subtotal()
  const discountAmount = appliedPromo ? Math.round(sub * (appliedPromo.percent / 100)) : 0
  const total = Math.max(0, sub - discountAmount + deliveryFee)

  function applyPromoCode(e: React.MouseEvent) {
    e.preventDefault()
    setPromoError(null)
    const cleanCode = promoInput.trim().toUpperCase()

    if (cleanCode === 'VIPNOVA10' || cleanCode === 'WELCOME10') {
      setAppliedPromo({ code: cleanCode, percent: 10 })
    } else if (cleanCode === 'NOVA15') {
      setAppliedPromo({ code: cleanCode, percent: 15 })
    } else {
      setPromoError('Invalid promo code. Try VIPNOVA10')
    }
  }

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (items.length === 0) router.replace('/shop')
  }, [items.length, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cartItems: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      clearCart()
      // Redirect to Order Confirmation page with MoMo instructions
      router.push(`/order-confirmation/${data.orderId}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-headline text-display-md uppercase text-brand-black mb-10">Checkout</h1>

      <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-12">
        {/* Left — contact + delivery + payment */}
        <div className="space-y-10">
          {/* Contact */}
          <section>
            <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-6 pb-2 border-b border-brand-black/10">
              Contact Details
            </h2>
            <div className="space-y-4">
              <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Ada Mensah" />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="ada@example.com" />
              <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+233 24 000 0000" />
            </div>
          </section>

          {/* Delivery */}
          <section>
            <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-6 pb-2 border-b border-brand-black/10">
              Delivery Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-body uppercase tracking-widest text-brand-black/50 mb-2">
                  Delivery Zone
                </label>
                <select
                  name="deliveryZoneId"
                  value={form.deliveryZoneId}
                  onChange={handleChange}
                  required
                  className="w-full border border-brand-black/20 bg-transparent px-4 py-3 text-sm font-body text-brand-black focus:outline-none focus:border-brand-black"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {z.estimatedDays} ({formatPrice(z.fee)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-body uppercase tracking-widest text-brand-black/50 mb-2">
                  Delivery Address
                </label>
                <textarea
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="House number, street, area, city"
                  className="w-full border border-brand-black/20 bg-transparent px-4 py-3 text-sm font-body text-brand-black focus:outline-none focus:border-brand-black resize-none"
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-6 pb-2 border-b border-brand-black/10">
              How Do You Want to Pay?
            </h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                    form.paymentMethod === method.value
                      ? 'border-brand-black bg-brand-black/5'
                      : 'border-brand-black/20 hover:border-brand-black/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={form.paymentMethod === method.value}
                    onChange={handleChange}
                    className="accent-brand-red"
                  />
                  <span className="text-sm font-body text-brand-black">{method.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-xs font-body text-brand-black/40">
              Secure checkout. Your details are safe with us.
            </p>
          </section>
        </div>

        {/* Right — order summary */}
        <div className="mt-10 lg:mt-0">
          <div className="bg-brand-black/5 rounded p-6 sticky top-24">
            <h2 className="font-headline text-lg uppercase tracking-widest text-brand-black mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm font-body">
                  <span className="text-brand-black/70">
                    {item.productName} <span className="text-brand-black/40">×{item.quantity}</span>
                    <br />
                    <span className="text-xs text-brand-black/40">{item.size} / {item.color}</span>
                  </span>
                  <span className="text-brand-black ml-4 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {/* Promo Code Input */}
            <div className="border-t border-brand-black/10 pt-4 mb-4">
              <label className="block text-xs font-body uppercase tracking-widest text-brand-black/50 mb-2">
                Have a Promo Code?
              </label>
              {appliedPromo ? (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 p-2.5 rounded text-xs font-body text-green-800">
                  <span className="font-semibold">Code &quot;{appliedPromo.code}&quot; applied (-{appliedPromo.percent}%)</span>
                  <button
                    onClick={() => setAppliedPromo(null)}
                    className="text-red-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="e.g. VIPNOVA10"
                    className="flex-1 border border-brand-black/20 bg-white px-3 py-2 text-xs font-body text-brand-black uppercase placeholder:normal-case focus:outline-none focus:border-brand-black rounded"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-brand-black text-white text-xs font-body uppercase tracking-wider px-3 py-2 rounded hover:bg-brand-black/80 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && (
                <p className="mt-1.5 text-xs font-body text-brand-red">{promoError}</p>
              )}
            </div>

            <div className="border-t border-brand-black/10 pt-4 space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-brand-black/60">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-black/60">Delivery</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-brand-black/10">
                <span>Total</span>
                <span className="text-brand-red">{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm font-body text-brand-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-brand-red text-white font-body text-sm uppercase tracking-widest py-4 hover:bg-brand-red/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing…' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-body uppercase tracking-widest text-brand-black/50 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-brand-black/20 bg-transparent px-4 py-3 text-sm font-body text-brand-black placeholder:text-brand-black/30 focus:outline-none focus:border-brand-black"
      />
    </div>
  )
}
