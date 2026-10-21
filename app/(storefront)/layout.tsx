import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { WhatsAppWidget } from '@/components/storefront/WhatsAppWidget'
import { MarketingConsent } from '@/components/storefront/MarketingConsent'
import { siteConfig } from '@/lib/site-config'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget />
      {(siteConfig.metaPixelId || siteConfig.tiktokPixelId) && (
        <MarketingConsent metaPixelId={siteConfig.metaPixelId} tiktokPixelId={siteConfig.tiktokPixelId} />
      )}
    </div>
  )
}
