'use client'

import { useState } from 'react'
import { payeeConflict, sellerName, useCart, type CartItem } from '@/lib/cart'
import { SellerConflictNotice } from './SellerConflictNotice'
import { formatPrice } from '@/lib/format'
import { optionLabel } from '@/lib/market'

type Variant = {
  id: string
  size: string
  color: string
  stockQuantity: number
  priceOverride: number | null
  sku: string
}

// Add-to-cart for Nova Market partner items: free-form options (any size/colour/type),
// auto-selected when there is only one. URBANOVA clothing keeps AddToCartForm (S–XXL grid).
export function MarketAddToCartForm({
  productId,
  productName,
  basePrice,
  variants,
  imageUrl,
  seller,
}: {
  productId: string
  productName: string
  basePrice: number
  variants: Variant[]
  imageUrl?: string
  seller?: CartItem['seller']
}) {
  const addItem = useCart((s) => s.addItem)
  const [conflict, setConflict] = useState<string | null>(null)
  const single = variants.length === 1
  const [selectedId, setSelectedId] = useState<string>(single ? variants[0].id : '')
  const [added, setAdded] = useState(false)
  const selected = variants.find((v) => v.id === selectedId) ?? null
  const canAdd = selected !== null && selected.stockQuantity > 0

  function handleAdd() {
    if (!selected) return
    const blocker = payeeConflict(useCart.getState().items, seller)
    if (blocker) return setConflict(sellerName(blocker))
    setConflict(null)
    addItem({
      variantId: selected.id,
      productId,
      productName,
      sku: selected.sku,
      size: selected.size,
      color: selected.color,
      price: selected.priceOverride ?? basePrice,
      quantity: 1,
      imageUrl,
      ...(seller ? { seller } : {}),
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {!single && (
        <div>
          <p className="mb-3 text-xs font-body uppercase tracking-widest text-brand-black/50">Choose an option</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stockQuantity === 0
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => setSelectedId(v.id)}
                  className={`border px-4 py-2.5 text-sm font-body transition-colors ${
                    out
                      ? 'cursor-not-allowed border-brand-black/10 text-brand-black/25 line-through'
                      : selectedId === v.id
                        ? 'border-brand-black bg-brand-black text-white'
                        : 'border-brand-black/20 text-brand-black hover:border-brand-black'
                  }`}
                >
                  {optionLabel(v)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selected && selected.stockQuantity > 0 && selected.stockQuantity <= 3 && (
        <p className="text-xs font-body text-brand-red">Only {selected.stockQuantity} left — order soon!</p>
      )}
      {single && variants[0].stockQuantity === 0 && <p className="text-sm font-body text-brand-black/60">SOLD OUT — back soon.</p>}

      <p className="font-headline text-2xl text-brand-black">{formatPrice(selected?.priceOverride ?? basePrice)}</p>

      {conflict && <SellerConflictNotice inBag={conflict} thisItem={seller?.name ?? 'URBANOVA'} />}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className={`w-full py-4 font-body text-sm uppercase tracking-widest transition-all duration-200 ${
          !canAdd ? 'cursor-not-allowed bg-brand-black/10 text-brand-black/30' : added ? 'bg-green-600 text-white' : 'bg-brand-red text-white hover:bg-brand-red/80'
        }`}
      >
        {added ? 'Added to Cart ✓' : !selected ? 'Choose an option' : selected.stockQuantity === 0 ? 'Sold out' : 'Add to Cart'}
      </button>
    </div>
  )
}
