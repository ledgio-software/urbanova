'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/delivery-zones', label: 'Delivery Zones' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* ─── Mobile Header Bar (Visible on mobile only) ───────────────────────── */}
      <div className="md:hidden bg-brand-black text-brand-white px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <div>
          <span className="font-headline text-lg tracking-widest uppercase">URBANOVA</span>
          <span className="text-[10px] font-body text-brand-white/40 ml-2 uppercase">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-brand-white/80 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ─── Mobile Slide-out Drawer Overlay ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-64 bg-brand-black min-h-full flex flex-col z-10 shadow-2xl border-r border-white/10">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="font-headline text-xl tracking-widest text-brand-white uppercase">URBANOVA</p>
                <p className="text-xs font-body text-white/40 mt-0.5">Admin Panel</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/50 hover:text-white p-1"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-sm font-body rounded-lg transition-colors ${
                      active
                        ? 'bg-brand-red text-white font-semibold'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm font-body text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors border-t border-white/10 mt-4 pt-4"
              >
                View Storefront ↗
              </a>
            </nav>

            <div className="px-4 py-4 border-t border-white/10">
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="w-full text-left px-4 py-3 text-sm font-body text-white/50 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Desktop Sidebar (Hidden on mobile, visible md+) ───────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 bg-brand-black min-h-screen flex-col border-r border-white/10">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-headline text-xl tracking-widest text-brand-white uppercase">URBANOVA</p>
          <p className="text-xs font-body text-white/30 mt-0.5">Admin Console</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 text-sm font-body rounded transition-colors ${
                  active
                    ? 'bg-brand-red text-white font-semibold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 text-xs font-body text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors mt-6 border-t border-white/10 pt-4"
          >
            View Storefront ↗
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full text-left px-3 py-2 text-sm font-body text-white/40 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
