// Partner websites (Reference I.7): every live partner has an address under URBANOVA's domain
// (<slug>.<PARTNER_ROOT_DOMAIN>) and may connect their own domain (e.g. kumasidrip.com).
// Edge-safe — used by middleware, so no database access here.

const hostOf = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  const v = value.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
  return normalizeHost(v) || undefined
}

/** Origin of the main URBANOVA site, for sending partner-site visitors to dashboards and policies. */
export function mainSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return (configured.startsWith('http') ? configured : `https://${configured}`).replace(/\/$/, '')
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
  return production ? `https://${production}` : 'http://localhost:3000'
}

/** Lowercase host without port or trailing dot. */
export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(':')[0].replace(/\.$/, '')
}

/** URBANOVA's own domain that partner sub-addresses live under, e.g. "urbanova.com". */
export function partnerRootDomain(): string | undefined {
  return hostOf(process.env.PARTNER_ROOT_DOMAIN)?.replace(/^www\./, '')
}

/** Hosts that serve the main URBANOVA site. */
function mainHosts(): Set<string> {
  const hosts = new Set<string>(['localhost', '127.0.0.1'])
  // MAIN_SITE_HOSTS: any extra domains of the main site, comma-separated (e.g. "urbanova.com.gh,shopurbanova.com")
  const extra = (process.env.MAIN_SITE_HOSTS ?? '').split(',')
  for (const v of [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, ...extra]) {
    const h = hostOf(v)
    if (h) {
      hosts.add(h)
      hosts.add(h.startsWith('www.') ? h.slice(4) : `www.${h}`)
    }
  }
  const root = partnerRootDomain()
  if (root) {
    hosts.add(root)
    hosts.add(`www.${root}`)
  }
  return hosts
}

export function isMainHost(host: string): boolean {
  const h = normalizeHost(host)
  return mainHosts().has(h) || h.endsWith('.vercel.app')
}

/** "kumasi-drip" for "kumasi-drip.urbanova.com"; undefined for anything else. */
export function subdomainSlug(host: string): string | undefined {
  const root = partnerRootDomain()
  const h = normalizeHost(host)
  if (!root || !h.endsWith(`.${root}`)) return undefined
  const label = h.slice(0, -root.length - 1)
  return label && !label.includes('.') && label !== 'www' ? label : undefined
}

/** A partner's own domain as stored: lowercase, no scheme/path/port, no leading "www.". */
export function normalizeCustomDomain(input: string): string {
  return normalizeHost(input.replace(/^https?:\/\//i, '').split('/')[0]).replace(/^www\./, '')
}

export const DOMAIN_PATTERN = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/

/** The public addresses of a partner's website. */
export function partnerSiteUrls(partner: { slug: string; customDomain: string | null }): { subdomain?: string; custom?: string; primary?: string } {
  const root = partnerRootDomain()
  const subdomain = root ? `https://${partner.slug}.${root}` : undefined
  const custom = partner.customDomain ? `https://${partner.customDomain}` : undefined
  return { subdomain, custom, primary: custom ?? subdomain }
}

/**
 * Where a request on a partner host is served from inside the app (/site/<host>/...),
 * a redirect back to the main site, or null to pass through (APIs, assets).
 */
export function partnerSitePath(pathname: string): { rewrite: string } | { mainSite: true } | null {
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/uploads/')) return null
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return { rewrite: pathname }
  if (/\.[a-z0-9]+$/i.test(pathname)) return null // icons, images, manifest
  if (pathname === '/' || pathname === '/shop' || pathname.startsWith('/shop/') || pathname === '/market' || pathname.startsWith('/partners/')) {
    return { rewrite: '' }
  }
  if (pathname.startsWith('/product/') || pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/order-confirmation/') || pathname === '/about') {
    return { rewrite: pathname }
  }
  if (pathname === '/contact') return { rewrite: '/about' }
  return { mainSite: true } // dashboards, policies, tracking etc. live on the main URBANOVA site
}
