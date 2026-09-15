'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const slides = [
  '/about/lookbook-1.webp',
  '/about/lookbook-2.webp',
  '/about/lookbook-3.webp',
  '/about/lookbook-4.webp',
  '/about/lookbook-5.webp',
]

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setPrev(current)
        setCurrent((c) => (c + 1) % slides.length)
        setFading(false)
      }, 800)
    }, 4000)
    return () => clearInterval(id)
  }, [current])

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-brand-navy">
      {/* Slideshow background */}
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={[
            'object-cover object-center transition-opacity duration-700',
            i === current && !fading ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{ zIndex: 0 }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55 z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 text-center text-white">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-white/60 mb-4">Est. 2026 · Accra</p>
        <h1 className="font-headline text-display-lg uppercase tracking-widest mb-6 leading-none">
          We Don&apos;t Wait.
        </h1>
        <p className="font-body text-lg text-white/75 leading-relaxed max-w-xl mx-auto">
          URBANOVA started with one idea: the city moves fast, and the ones who own it move faster.
          Every piece we drop is built for that person — the one who walks in and changes the temperature of the room.
        </p>
        <a
          href="/shop"
          className="mt-10 inline-block border border-white/60 text-white font-body text-xs uppercase tracking-widest px-10 py-4 hover:bg-white hover:text-brand-black transition-colors"
        >
          Shop the Drop
        </a>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={[
              'w-6 h-0.5 transition-all duration-300',
              i === current ? 'bg-white' : 'bg-white/30',
            ].join(' ')}
          />
        ))}
      </div>
    </section>
  )
}
