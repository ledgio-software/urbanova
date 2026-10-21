'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  categories: { id: string; name: string; slug: string }[]
}

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/movement', label: 'Movement' },
  { href: '/vision-mission', label: 'Vision & Mission' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
]

// Phone/tablet navigation (the desktop nav is hidden below the md breakpoint).
export function MobileMenu({ categories }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close after navigating
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const linkClass = (href: string) =>
    `block py-3 font-body text-base uppercase tracking-widest transition-colors ${
      pathname === href ? 'text-brand-red' : 'text-brand-white/90 hover:text-brand-white'
    }`

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="p-1 text-brand-white/80 hover:text-brand-white transition-colors"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Dim the page below the header; tapping it closes the menu */}
          <div className="absolute inset-x-0 top-full h-screen bg-black/50" aria-hidden onClick={() => setOpen(false)} />
          <nav
            id="mobile-menu"
            aria-label="Main menu"
            className="absolute inset-x-0 top-full max-h-[80vh] overflow-y-auto border-t border-white/10 bg-brand-navy px-6 pb-8 pt-2 shadow-2xl"
          >
            <Link href="/shop" className={linkClass('/shop')}>
              Shop
            </Link>
            {categories.length > 0 && (
              <ul className="mb-2 border-l border-white/15 pl-4">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop/${cat.slug}`}
                      className={`block py-2 font-body text-sm uppercase tracking-widest ${
                        pathname === `/shop/${cat.slug}` ? 'text-brand-red' : 'text-brand-white/60 hover:text-brand-white'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            ))}
            <Link href="/cart" className={linkClass('/cart')}>
              Cart
            </Link>
          </nav>
        </>
      )}
    </div>
  )
}
