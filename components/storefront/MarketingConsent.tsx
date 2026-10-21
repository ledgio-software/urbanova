'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { OPEN_COOKIE_SETTINGS_EVENT, readConsent, saveConsent } from '@/lib/consent'

type PixelWindow = Window & { fbq?: (...args: unknown[]) => void; ttq?: { page: () => void } }

// Official base snippets from Meta and TikTok. Each fires the first PageView itself.
// IDs are validated as alphanumeric in lib/site-config.ts before reaching here.
const metaSnippet = (id: string) =>
  `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`

const tiktokSnippet = (id: string) =>
  `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${id}');ttq.page();}(window,document,'ttq');`

function injectOnce(elementId: string, code: string) {
  if (document.getElementById(elementId)) return
  const script = document.createElement('script')
  script.id = elementId
  script.text = code
  document.head.appendChild(script)
}

interface Props {
  metaPixelId?: string
  tiktokPixelId?: string
}

// Cookie banner + retargeting pixels. Rendered only when at least one pixel ID is configured.
// Nothing non-essential loads until the visitor taps Accept (Policies & Terms s.4).
export function MarketingConsent({ metaPixelId, tiktokPixelId }: Props) {
  const pathname = usePathname()
  const [bannerOpen, setBannerOpen] = useState(false)
  const [granted, setGranted] = useState(false)
  const skipNextPageView = useRef(true)

  useEffect(() => {
    const choice = readConsent()
    if (choice) setGranted(choice.marketing)
    else setBannerOpen(true)
    const reopen = () => setBannerOpen(true)
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen)
  }, [])

  useEffect(() => {
    if (!granted) return
    if (metaPixelId) injectOnce('meta-pixel', metaSnippet(metaPixelId))
    if (tiktokPixelId) injectOnce('tiktok-pixel', tiktokSnippet(tiktokPixelId))
  }, [granted, metaPixelId, tiktokPixelId])

  // Client-side navigations don't reload the snippets, so report each new page view.
  useEffect(() => {
    if (!granted) return
    if (skipNextPageView.current) {
      skipNextPageView.current = false // the snippets already sent this one
      return
    }
    const w = window as PixelWindow
    w.fbq?.('track', 'PageView')
    w.ttq?.page()
  }, [pathname, granted])

  const decide = (marketing: boolean) => {
    const wasGranted = granted
    saveConsent(marketing)
    setGranted(marketing)
    setBannerOpen(false)
    // Pixel scripts can't be unloaded once running; a reload starts the visit without them.
    if (wasGranted && !marketing) window.location.reload()
  }

  if (!bannerOpen) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-brand-navy text-brand-white shadow-2xl"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-body text-sm leading-relaxed text-brand-white/80">
          We use essential cookies to run the store. With your OK, we also use marketing cookies from Meta and TikTok
          to show you URBANOVA ads.{' '}
          <Link href="/legal/cookie-policy" className="underline underline-offset-4 hover:text-brand-white">
            Cookie Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide(false)}
            className="flex-1 sm:flex-none border border-white/30 px-5 py-2.5 font-body text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="flex-1 sm:flex-none bg-brand-red px-5 py-2.5 font-body text-xs uppercase tracking-widest text-white hover:bg-brand-red/80 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
