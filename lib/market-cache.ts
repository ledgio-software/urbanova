import { revalidatePath } from 'next/cache'

/**
 * Storefront pages are cached for 60s. When a partner listing, a partner's status or a market
 * category changes, drop those caches so a hidden product or suspended partner disappears at once.
 */
export function revalidateMarketPages() {
  revalidatePath('/market')
  revalidatePath('/partners/[slug]', 'page')
  revalidatePath('/product/[slug]', 'page')
  revalidatePath('/sitemap.xml')
}
