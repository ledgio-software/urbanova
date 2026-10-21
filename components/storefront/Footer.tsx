import Link from 'next/link'
import { CookieSettingsButton } from './CookieSettingsButton'
import { InstallAppButton } from './InstallAppButton'
import { siteConfig } from '@/lib/site-config'

export function Footer() {
  return (
    <footer className="bg-brand-navy border-t border-white/10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-headline text-xl uppercase tracking-widest text-brand-white">URBANOVA</p>
            <p className="mt-2 text-sm text-brand-white/50 font-body">Bold City. Bold You.</p>
            <InstallAppButton />
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
              <li><Link href="/vision-mission" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Vision &amp; Mission</Link></li>
              <li><Link href="/movement" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">The Movement</Link></li>
              <li><Link href="/movement#partners" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Partner With Us</Link></li>
              <li><Link href="/contact" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="text-xs font-body uppercase tracking-widest text-brand-white/40 mb-3">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/legal/shipping-returns" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/legal/terms-of-service" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/legal/privacy-policy" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/cookie-policy" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Cookie Policy</Link></li>
              {(siteConfig.metaPixelId || siteConfig.tiktokPixelId) && (
                <li><CookieSettingsButton className="text-sm text-brand-white/70 hover:text-brand-white transition-colors" /></li>
              )}
              <li><Link href="/legal/website-terms" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Website Terms of Use</Link></li>
              <li><Link href="/legal/complaints" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Complaints</Link></li>
              <li><Link href="/movement#policies" className="text-sm text-brand-white/70 hover:text-brand-white transition-colors">Movement Policies</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter & WhatsApp VIP Community */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="lg:flex lg:items-center lg:justify-between gap-8">
            <div className="mb-6 lg:mb-0 max-w-xl">
              <p className="font-headline text-xl uppercase tracking-widest text-brand-white">Join the Rise.</p>
              <p className="text-sm text-brand-white/70 mt-1 leading-relaxed">
                Join our WhatsApp group to get an exclusive discount, early drop access, and let&apos;s build the streets together.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <a
                href="https://chat.whatsapp.com/FdD9RuSUpIUFOAPfLJ16Vz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-black font-body text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded hover:bg-[#20bd5a] transition-colors shadow-md"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                Join WhatsApp Group
              </a>
              <form className="flex gap-2" action="/api/newsletter" method="POST">
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  required
                  className="bg-white/10 border border-white/20 rounded px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-white/30 focus:outline-none focus:border-brand-red transition-colors min-w-[180px]"
                />
                <button
                  type="submit"
                  className="bg-brand-red text-white text-xs font-body uppercase tracking-widest px-4 py-2.5 rounded hover:bg-brand-red/80 transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs text-brand-white/50 font-body">
              &copy; {new Date().getFullYear()} URBANOVA. All rights reserved.
            </p>
            <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-brand-white/30 font-body">
              The URBANOVA name, logos, designs, graphics and photos are protected. You may not copy, print or sell
              them, or use our name or logo on products, without written permission.{' '}
              <Link href="/legal/website-terms" className="underline underline-offset-2 hover:text-brand-white/60">
                Website Terms
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Social icons */}
            <a
              href={siteConfig.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="URBANOVA on TikTok"
              className="text-brand-white/40 hover:text-brand-white transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
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
