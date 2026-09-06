'use client'

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

  return (
    <aside className="w-56 shrink-0 bg-brand-black min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-headline text-xl tracking-widest text-brand-white uppercase">URBANOVA</p>
        <p className="text-xs font-body text-white/30 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 text-sm font-body rounded transition-colors ${
                active
                  ? 'bg-brand-red/10 text-brand-red'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
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
  )
}
