import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { WhatsAppWidget } from '@/components/storefront/WhatsAppWidget'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget />
    </div>
  )
}
