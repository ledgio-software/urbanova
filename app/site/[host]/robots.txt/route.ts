import { normalizeHost } from '@/lib/partner-hosts'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ host: string }> }) {
  const host = normalizeHost(decodeURIComponent((await params).host))
  const body = `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order-confirmation/\nDisallow: /api/\n\nSitemap: https://${host}/sitemap.xml\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
