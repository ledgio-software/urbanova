import { mainSiteOrigin } from '@/lib/partner-hosts'

export const dynamic = 'force-dynamic'

// Partner websites send dashboards, policies and tracking to the main URBANOVA site.
// Done here rather than in middleware so the cross-domain Location header is kept absolute.
export function GET(req: Request) {
  const raw = req.headers.get('x-partner-site-path') ?? '/' // set by middleware
  // Only same-site paths: "/partner", never "//evil.com" or "https://…"
  const path = raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\') ? raw : '/'
  return Response.redirect(new URL(path, mainSiteOrigin()).toString(), 307)
}
