'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'

type Variant = {
  id: string
  size: string
  color: string
  stockQuantity: number
  priceOverride: number | null
  sku: string
}

type Props = {
  productId: string
  productName: string
  basePrice: number
  variants: Variant[]
  imageUrl?: string
}

const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL']

export function AddToCartForm({ productId, productName, basePrice, variants, imageUrl }: Props) {
  const addItem = useCart((s) => s.addItem)

  const colors = Array.from(new Set(variants.map((v) => v.color)))
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? '')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [added, setAdded] = useState(false)

  const colorVariants = variants.filter((v) => v.color === selectedColor)
  const selectedVariant = colorVariants.find((v) => v.size === selectedSize) ?? null
  const canAdd = selectedVariant !== null && selectedVariant.stockQuantity > 0

  function handleAdd() {
    if (!selectedVariant) return
    addItem({
      variantId: selectedVariant.id,
      productId,
      productName,
      sku: selectedVariant.sku,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.priceOverride ?? basePrice,
      quantity: 1,
      imageUrl,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Color selector */}
      {colors.length > 1 && (
        <div>
          <p className="text-xs font-body uppercase tracking-widest text-brand-black/40 mb-3">
            Color — <span className="text-brand-black">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => { setSelectedColor(color); setSelectedSize('') }}
                className={`text-xs font-body border px-3 py-1.5 transition-colors ${
                  selectedColor === color
                    ? 'border-brand-black text-brand-black'
                    : 'border-brand-black/20 text-brand-black/60 hover:border-brand-black/60'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-body uppercase tracking-widest text-brand-black/40">Size</p>
          <button className="text-xs font-body text-brand-red uppercase tracking-widest hover:text-brand-black transition-colors">
            Size Guide
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SIZE_ORDER.map((size) => {
            const variant = colorVariants.find((v) => v.size === size)
            const outOfStock = !variant || variant.stockQuantity === 0
            return (
              <button
                key={size}
                disabled={outOfStock}
                onClick={() => setSelectedSize(size)}
                className={`py-3 text-sm font-body border transition-colors ${
                  outOfStock
                    ? 'border-brand-black/10 text-brand-black/20 cursor-not-allowed line-through'
                    : selectedSize === size
                    ? 'border-brand-black bg-brand-black text-brand-white'
                    : 'border-brand-black/30 text-brand-black hover:border-brand-black'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
        {!selectedSize ? (
          <p className="mt-2 text-xs font-body text-brand-black/40">Select a size to continue</p>
        ) : (
          selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 3 && (
            <p className="mt-2 text-xs font-body font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Only {selectedVariant.stockQuantity} left in Size {selectedVariant.size} — Order soon!
            </p>
          )
        )}
      </div>

      {/* Price */}
      <p className="font-headline text-2xl text-brand-black">
        {formatPrice(selectedVariant?.priceOverride ?? basePrice)}
      </p>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className={`w-full py-4 font-body text-sm uppercase tracking-widest transition-all duration-200 ${
          !canAdd
            ? 'bg-brand-black/10 text-brand-black/30 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-brand-red text-white hover:bg-brand-red/80'
        }`}
      >
        {added ? 'Added to Cart ✓' : !selectedSize ? 'Select a Size' : 'Add to Cart'}
      </button>
    </div>
  )
}
