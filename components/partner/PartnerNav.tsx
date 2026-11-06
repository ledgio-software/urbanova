'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/partner', label: 'Dashboard', exact: true },
  { href: '/partner/products', label: 'Products' },
  { href: '/partner/sales', label: 'Sales' },
  { href: '/partner/profile', label: 'My Page' },
  { href: '/partner/password', label: 'Password' },
]

export function PartnerNav({ name }: { name: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const links = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm font-body uppercase tracking-wider transition-colors ${
              active ? 'bg-white/10 text-brand-white' : 'text-brand-white/60 hover:text-brand-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/partner/login' })}
        className="mt-4 px-3 py-2 text-left text-sm font-body uppercase tracking-wider text-brand-white/40 hover:text-brand-white"
      >
        Log out
      </button>
    </nav>
  )

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-brand-navy px-4 py-3 text-brand-white md:hidden">
        <div>
          <span className="font-headline text-lg uppercase tracking-widest">URBANOVA</span>
          <span className="ml-2 text-[10px] font-body uppercase text-brand-white/40">Partner</span>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="p-2">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {open && <div className="border-b border-white/10 bg-brand-navy md:hidden">{links}</div>}

      <aside className="hidden w-60 shrink-0 flex-col bg-brand-navy md:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-headline text-xl uppercase tracking-widest text-brand-white">URBANOVA</p>
          <p className="mt-0.5 text-[10px] font-body uppercase tracking-widest text-brand-white/40">Partner dashboard</p>
          <p className="mt-3 truncate text-xs font-body text-brand-white/70">{name}</p>
        </div>
        {links}
      </aside>
    </>
  )
}
