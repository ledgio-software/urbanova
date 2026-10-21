'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export type LookbookItem =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string; poster: string; alt: string }

// Grid of lookbook tiles; tapping one opens a full-screen viewer with prev/next,
// keyboard (← → Esc) and swipe navigation. A video item is shown as a 2×2 feature tile.
export function LookbookGallery({ items }: { items: LookbookItem[] }) {
  const [index, setIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const touchStartX = useRef<number | null>(null)
  const count = items.length
  const isOpen = index !== null

  const show = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])
  const close = useCallback(() => setIndex(null), [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') show(index + 1)
      if (e.key === 'ArrowLeft') show(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, show])

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || index === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > 50) show(dx < 0 ? index + 1 : index - 1)
  }

  const current = index !== null ? items[index] : null

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, i) =>
          item.type === 'video' ? (
            <button
              key={item.src}
              type="button"
              onClick={() => show(i)}
              aria-label={`Play video: ${item.alt}`}
              className="group relative col-span-2 row-span-2 aspect-[3/4] lg:aspect-auto overflow-hidden bg-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={item.poster}
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={item.src} type="video/mp4" />
              </video>
            </button>
          ) : (
            <button
              key={item.src}
              type="button"
              onClick={() => show(i)}
              aria-label={`View photo: ${item.alt}`}
              className="group relative aspect-[3/4] overflow-hidden bg-brand-black/5 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ),
        )}
      </div>

      <dialog
        ref={dialogRef}
        onClose={close}
        aria-label="Lookbook viewer"
        className="m-0 h-full max-h-none w-full max-w-none bg-black/95 p-0 text-brand-white backdrop:bg-black/80"
      >
        {current && index !== null && (
          <div
            className="relative flex h-full w-full items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) close()
            }}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX
            }}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative h-[85vh] w-[92vw] max-w-5xl">
              {current.type === 'video' ? (
                <video
                  key={current.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  poster={current.poster}
                  aria-label={current.alt}
                  className="h-full w-full object-contain"
                >
                  <source src={current.src} type="video/mp4" />
                </video>
              ) : (
                <Image key={current.src} src={current.src} alt={current.alt} fill sizes="92vw" className="object-contain" />
              )}
            </div>

            <p className="absolute top-4 left-4 font-body text-xs uppercase tracking-widest text-brand-white/60">
              {index + 1} / {count}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close viewer"
              className="absolute top-2 right-2 flex h-11 w-11 items-center justify-center text-3xl leading-none text-brand-white/80 hover:text-brand-white"
            >
              ×
            </button>
            <button
              type="button"
              onClick={() => show(index - 1)}
              aria-label="Previous"
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-2xl text-brand-white/80 hover:bg-black/70 hover:text-brand-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => show(index + 1)}
              aria-label="Next"
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-2xl text-brand-white/80 hover:bg-black/70 hover:text-brand-white"
            >
              ›
            </button>
          </div>
        )}
      </dialog>
    </>
  )
}
