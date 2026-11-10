import { getSitePartner } from '@/lib/market-queries'
import { normalizeHost } from '@/lib/partner-hosts'

export const dynamic = 'force-dynamic'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Sitemap for a partner's website, so Google can find every product on their own address.
export async function GET(_req: Request, { params }: { params: Promise<{ host: string }> }) {
  const raw = (await params).host
  const partner = await getSitePartner(raw)
  if (!partner) return new Response('Not found', { status: 404 })
  const base = `https://${partner.customDomain ?? normalizeHost(decodeURIComponent(raw))}`
  const urls = [`${base}/`, `${base}/about`, ...partner.products.map((p) => `${base}/product/${p.slug}`)]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(u)}</loc></url>`)
    .join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
