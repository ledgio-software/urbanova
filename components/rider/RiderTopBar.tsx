'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

export function RiderTopBar({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-navy px-4 py-3 text-brand-white">
      <Link href="/rider" className="leading-tight">
        <span className="font-headline text-lg uppercase tracking-widest">URBANOVA</span>
        <span className="ml-2 text-[10px] font-body uppercase text-brand-white/50">Delivery</span>
        <span className="block text-xs font-body text-brand-white/70">{name}</span>
      </Link>
      <nav className="flex gap-4 font-body text-xs uppercase tracking-wider text-brand-white/70">
        <Link href="/rider/password">Password</Link>
        <button type="button" onClick={() => signOut({ callbackUrl: '/rider/login' })}>Log out</button>
      </nav>
    </header>
  )
}
