import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-brand-navy border-t border-white/10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-headline text-xl uppercase tracking-widest text-brand-white">URBANOVA</p>
            <p className="mt-2 text-sm text-brand-white/50 font-body">Bold City. Bold You.</p>
          </div>

          {/* Shop links */}
          <div>
            <p className="text-xs font-body uppercase tracking-widest text-brand-white/40 mb-3">Shop</p>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">All Products</Link></li>
              <li><Link href="/shop/t-shirts" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">T-Shirts</Link></li>
              <li><Link href="/shop/hoodies" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Hoodies</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="text-xs font-body uppercase tracking-widest text-brand-white/40 mb-3">Company</p>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="text-xs font-body uppercase tracking-widest text-brand-white/40 mb-3">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/legal/shipping-returns" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/legal/privacy-policy" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms-of-service" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="md:flex md:items-center md:justify-between gap-8">
            <div className="mb-4 md:mb-0">
              <p className="font-headline text-lg uppercase tracking-widest text-brand-white">Join the Rise.</p>
              <p className="text-sm text-brand-white/50 mt-1">Be first to know about new drops. No spam, just nova energy.</p>
            </div>
            <form className="flex gap-2 max-w-sm w-full" action="/api/newsletter" method="POST">
              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                className="flex-1 bg-white/10 border border-white/20 rounded px-4 py-2 text-sm text-brand-white placeholder:text-brand-white/30 focus:outline-none focus:border-brand-red transition-colors"
              />
              <button
                type="submit"
                className="bg-brand-red text-white text-sm font-body uppercase tracking-widest px-4 py-2 rounded hover:bg-brand-red/80 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-white/30 font-body">
            &copy; {new Date().getFullYear()} URBANOVA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social icons */}
            <a href="#" aria-label="Instagram" className="text-brand-white/40 hover:text-brand-white transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" aria-label="X (Twitter)" className="text-brand-white/40 hover:text-brand-white transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
