'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

export function CartView() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-headline text-display-md uppercase text-brand-black">Your Cart</p>
        <p className="mt-6 font-body text-brand-black/60 text-lg">
          Your cart&apos;s as empty as a Monday morning. Let&apos;s fix that.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-brand-red text-white font-body text-sm uppercase tracking-widest px-8 py-4 hover:bg-brand-red/80 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-headline text-display-md uppercase text-brand-black mb-10">Your Cart</h1>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">
        {/* Items */}
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 border-b border-brand-black/10 pb-6">
              {/* Image */}
              <div className="relative h-24 w-20 flex-shrink-0 bg-brand-white rounded overflow-hidden">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/5">
                    <span className="font-headline text-2xl text-brand-navy/20">U</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm uppercase tracking-wide text-brand-black font-medium">{item.productName}</p>
                <p className="mt-0.5 text-xs font-body text-brand-black/50">{item.size} · {item.color}</p>
                <p className="mt-1 text-sm font-body text-brand-black">{formatPrice(item.price)}</p>

                <div className="mt-3 flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-brand-black/20">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1 text-brand-black/60 hover:text-brand-black transition-colors"
                      aria-label="Decrease"
                    >−</button>
                    <span className="px-3 py-1 text-sm font-body text-brand-black border-x border-brand-black/20">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1 text-brand-black/60 hover:text-brand-black transition-colors"
                      aria-label="Increase"
                    >+</button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs font-body text-brand-black/40 hover:text-brand-red transition-colors uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Line total */}
              <p className="text-sm font-body text-brand-black flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 lg:mt-0">
          <div className="bg-brand-black/5 rounded p-6 sticky top-24">
            <p className="font-headline text-lg uppercase text-brand-black mb-4">Order Summary</p>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-brand-black/60">Subtotal</span>
                <span className="text-brand-black">{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-black/60">Delivery</span>
                <span className="text-brand-black/60">Calculated at checkout</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-black/10 flex justify-between font-body font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal())}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full bg-brand-red text-white text-center font-body text-sm uppercase tracking-widest py-4 hover:bg-brand-red/80 transition-colors"
            >
              Checkout →
            </Link>
            <Link
              href="/shop"
              className="mt-3 block w-full text-center text-xs font-body uppercase tracking-widest text-brand-black/50 hover:text-brand-black transition-colors py-2"
            >
              Continue Shopping
            </Link>

            <p className="mt-4 text-xs font-body text-brand-black/40 text-center">
              Secure checkout. Your details are safe with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
