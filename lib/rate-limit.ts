// In-memory sliding window rate limiter.
// Works per function instance — adequate for a single-region small store.
// For multi-instance production, swap for Upstash Redis (@upstash/ratelimit).

const store = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) return false
  hits.push(now)
  store.set(key, hits)
  return true
}

export function getIp(req: Request): string {
  const forwarded = (req.headers as Headers).get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}
