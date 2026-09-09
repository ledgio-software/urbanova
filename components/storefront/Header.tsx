import Link from 'next/link'
import { getCategories, type CategoryRow } from '@/lib/products'
import { CartCount } from './CartCount'

export async function Header() {
  const categories = await getCategories()

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-brand-red text-white text-[11px] font-body uppercase tracking-widest text-center py-2 px-4 font-semibold">
        ⚡ FREE ACCRA DELIVERY ON ORDERS OVER GHS 500 &nbsp;|&nbsp; USE CODE <span className="underline font-bold font-mono">VIPNOVA10</span> FOR 10% OFF ⚡
      </div>

      <header className="sticky top-0 z-50 bg-brand-navy border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="font-headline text-2xl uppercase tracking-widest text-brand-white hover:text-brand-red transition-colors"
            >
              URBANOVA
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="group relative">
                <Link
                  href="/shop"
                  className="text-sm font-body uppercase tracking-widest text-brand-white/80 hover:text-brand-white transition-colors"
                >
                  Shop
                </Link>
                {categories.length > 0 && (
                  <div className="absolute left-0 top-full hidden group-hover:block pt-2">
                    <div className="bg-brand-navy border border-white/10 rounded py-2 min-w-[160px]">
                      {categories.map((cat: CategoryRow) => (
                        <Link
                          key={cat.id}
                          href={`/shop/${cat.slug}`}
                          className="block px-4 py-2 text-sm text-brand-white/70 hover:text-brand-white hover:bg-white/5 uppercase tracking-wider transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/about"
                className="text-sm font-body uppercase tracking-widest text-brand-white/80 hover:text-brand-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/track-order"
                className="text-sm font-body uppercase tracking-widest text-brand-white/80 hover:text-brand-white transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/contact"
                className="text-sm font-body uppercase tracking-widest text-brand-white/80 hover:text-brand-white transition-colors"
              >
                Contact
              </Link>
            </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-1 text-brand-white/80 hover:text-brand-white transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <CartCount />
            </Link>

            {/* Mobile menu placeholder — full implementation in Phase 5 */}
            <button className="md:hidden p-1 text-brand-white/80 hover:text-brand-white transition-colors" aria-label="Open menu">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  </>
  )
}
